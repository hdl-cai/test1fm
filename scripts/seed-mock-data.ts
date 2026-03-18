/**
 * seed-mock-data.ts
 * FlockMate — 1-Year Mock Data Seed Script
 *
 * Generates fully connected operational data for 1 year prior to today:
 *   - ~7 completed cycles + 1 active cycle per farm (8 farms total)
 *   - Daily logs (grower + technician entries)
 *   - Performance metrics derived from daily logs
 *   - Vaccination schedules (all completed for past cycles)
 *   - Health records + medication logs
 *   - Harvest logs, harvest performance (EPEF/BPI from actual log data)
 *   - Harvest sales + payment schedules
 *   - Settlement statements (deductions = delivered inputs + cash advance)
 *   - Cash advance requests (deducted from settlement)
 *   - Cycle expenses (approved)
 *   - Monthly payroll for all admins + technicians
 *   - Financial ledger (every financial event written here)
 *   - Grower performance records (points computed from actual EPEF)
 *
 * DATA INTEGRITY GUARANTEES:
 *   harvest_performance.total_feed_consumed_kg = SUM(daily_logs.feed_used_kg)
 *   harvest_performance.total_mortality_count  = SUM(daily_logs.mortality_count)
 *   settlement_statements.total_deductions     = SUM(settlement_deductions.amount)
 *   settlement_statements.final_net_payout     = grower_fee_total - total_deductions - ewt_amount
 *   financial_ledger amounts match their source records exactly
 *
 * Usage:
 *   npx tsx scripts/seed-mock-data.ts
 *
 * Must be run AFTER seed-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrgContext {
  org: any
  admin: any
  technicians: any[]
  growers: any[]
  farms: any[]
  farmAssignments: any[]
  vaccinationTemplateId: string
  epefBrackets: any[]
  bpiBrackets: any[]
  expenseCategories: any[]
  // Performance profile
  fcrBase: number        // target FCR
  fcrVariance: number    // +/- random range
  mortalityBase: number  // base daily mortality rate (as fraction of remaining birds)
  mortalityVariance: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function dateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function tsStr(date: Date): string {
  return date.toISOString()
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}

async function batchInsert(table: string, rows: any[], batchSize = 100): Promise<any[]> {
  const results: any[] = []
  for (let i = 0; i < rows.length; i += batchSize) {
    const { data, error } = await supabase
      .from(table)
      .insert(rows.slice(i, i + batchSize))
      .select()
    if (error) {
      console.error(`❌ Insert error on ${table}:`, error.message)
      process.exit(1)
    }
    results.push(...(data || []))
  }
  return results
}

async function singleInsert(table: string, row: any): Promise<any> {
  const { data, error } = await supabase.from(table).insert(row).select().single()
  if (error) {
    console.error(`❌ Insert error on ${table}:`, error.message, JSON.stringify(row).slice(0, 200))
    process.exit(1)
  }
  return data
}

function getEpefBracket(epef: number, brackets: any[]): any | null {
  return brackets.find(b => epef >= b.min_epef && epef < b.max_epef) || null
}

function getBpiBracket(bpi: number, brackets: any[]): any | null {
  return brackets.find(b => bpi >= b.min_bpi && bpi < b.max_bpi) || null
}

function computeEpef(avgDailyGainG: number, livabilityPct: number, fcr: number): number {
  // EPEF = (avg_daily_gain_g * livability_pct) / fcr * 10
  return round4((avgDailyGainG * livabilityPct) / fcr * 10)
}

function computeBpi(avgWeightKg: number, livabilityPct: number, daysInHouse: number, fcr: number): number {
  // BPI = (avg_weight_kg * livability_pct * 100) / (fcr * days_in_house)
  return round4((avgWeightKg * livabilityPct * 100) / (fcr * daysInHouse))
}

function computePoints(
  epef: number,
  fcr: number,
  mortalityRate: number,
  orgAvgEpef: number,
  lastThreeAboveAvg: boolean
): {
  basePoints: number
  fcrBonusPoints: number
  mortalityBonusPoints: number
  cycleCompletionPoints: number
  consistencyBonusPoints: number
  totalPoints: number
} {
  const basePoints = round2(epef * 0.5)
  const fcrBonusPoints = round2(Math.max(0, (2.0 - fcr) * 50))
  const mortalityBonusPoints = round2(Math.max(0, (1.0 - mortalityRate) * 30))
  const cycleCompletionPoints = 10
  const consistencyBonusPoints = lastThreeAboveAvg ? 20 : 0
  const totalPoints = round2(basePoints + fcrBonusPoints + mortalityBonusPoints + cycleCompletionPoints + consistencyBonusPoints)
  return { basePoints, fcrBonusPoints, mortalityBonusPoints, cycleCompletionPoints, consistencyBonusPoints, totalPoints }
}

// ── Load Context ──────────────────────────────────────────────────────────────

async function loadOrgContext(slug: string, isHighPerformer: boolean): Promise<OrgContext> {
  const { data: org } = await supabase.from('organizations').select('*').eq('slug', slug).single()
  if (!org) { console.error(`❌ Org not found: ${slug}`); process.exit(1) }

  const { data: profiles } = await supabase.from('profiles').select('*').eq('org_id', org.id)
  const admins      = profiles!.filter(p => p.role === 'admin')
  const technicians = profiles!.filter(p => p.role === 'technician')
  const growers     = profiles!.filter(p => p.role === 'grower')

  const { data: farms } = await supabase.from('farms').select('*').eq('org_id', org.id).order('farm_id_code')
  const { data: farmAssignments } = await supabase.from('farm_assignments').select('*').eq('org_id', org.id)
  const { data: epefBrackets } = await supabase.from('epef_incentive_brackets').select('*').eq('org_id', org.id).order('min_epef')
  const { data: bpiBrackets } = await supabase.from('bpi_incentive_brackets').select('*').eq('org_id', org.id).order('min_bpi')
  const { data: vatTemplate } = await supabase.from('vaccination_schedule_templates').select('id').eq('is_system_default', true).single()
  const { data: expenseCategories } = await supabase.from('expense_categories').select('*').eq('is_system_default', true)

  return {
    org,
    admin: admins[0],
    technicians,
    growers,
    farms: farms!,
    farmAssignments: farmAssignments!,
    vaccinationTemplateId: vatTemplate!.id,
    epefBrackets: epefBrackets!,
    bpiBrackets: bpiBrackets!,
    expenseCategories: expenseCategories!,
    fcrBase: isHighPerformer ? 1.65 : 1.82,
    fcrVariance: 0.08,
    mortalityBase: isHighPerformer ? 0.00065 : 0.00110,
    mortalityVariance: 0.0003,
  }
}

// ── Generate One Cycle ────────────────────────────────────────────────────────

async function seedCycle(
  ctx: OrgContext,
  farm: any,
  grower: any,
  technician: any,
  startDate: Date,
  batchNumber: number,
  isActive: boolean,
  growerCumulativePayment: number
): Promise<{ cycleId: string; endDate: Date; netPayout: number; epefScore: number }> {

  const CYCLE_DAYS = randInt(38, 42)
  const INITIAL_BIRDS = randInt(14000, Math.min(farm.capacity, 20000))
  const endDate = addDays(startDate, CYCLE_DAYS)
  const harvestDate = isActive ? null : endDate

  // ── Create cycle ──────────────────────────────────────────────────────────

  const cycle = await singleInsert('production_cycles', {
    org_id: ctx.org.id,
    farm_id: farm.id,
    grower_id: grower.id,
    batch_name: `BATCH-${String(batchNumber).padStart(3, '0')}`,
    batch_number: `${farm.farm_id_code}-${new Date(startDate).getFullYear()}-${String(batchNumber).padStart(2, '0')}`,
    breed: 'Cobb 500',
    status: isActive ? 'active' : 'completed',
    initial_birds: INITIAL_BIRDS,
    starter_feed_projected_kg: round3(INITIAL_BIRDS * 0.18),
    grower_feed_projected_kg: round3(INITIAL_BIRDS * 0.60),
    finisher_feed_projected_kg: round3(INITIAL_BIRDS * 0.55),
    target_weight_kg: 2.1,
    start_date: dateStr(startDate),
    anticipated_harvest_date: dateStr(addDays(startDate, 42)),
    actual_end_date: harvestDate ? dateStr(harvestDate) : null,
    is_flagged: false,
    vaccination_template_id: ctx.vaccinationTemplateId,
  })

  // ── DOC Loading ───────────────────────────────────────────────────────────

  await singleInsert('doc_loading', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    hatchery_name: 'San Miguel Hatchery',
    source_farm_cert_no: `BAI-CERT-${cycle.id.slice(0, 8).toUpperCase()}`,
    arrival_time: addDays(startDate, 0).toISOString(),
    delivered_quantity: INITIAL_BIRDS + randInt(0, 20),
    actual_placed_quantity: INITIAL_BIRDS,
    dead_on_arrival_count: randInt(0, 10),
    average_chick_weight_g: round2(rand(38, 44)),
    chick_uniformity_score: round2(rand(88, 96)),
    beak_condition: 'Normal',
    hydration_status: 'Hydrated',
    transport_truck_temp_c: round2(rand(22, 28)),
    recorded_by: technician.id,
  })

  // ── Vaccination Schedules ─────────────────────────────────────────────────

  const { data: templateItems } = await supabase
    .from('vaccination_template_items')
    .select('*')
    .eq('template_id', ctx.vaccinationTemplateId)
    .order('sequence_order')

  const vaccinationRows = (templateItems || []).map(item => {
    const scheduledDate = addDays(startDate, item.target_age_days)
    const isPast = scheduledDate < new Date()
    return {
      org_id: ctx.org.id,
      cycle_id: cycle.id,
      template_item_id: item.id,
      vaccine_name: item.vaccine_name,
      target_age_days: item.target_age_days,
      admin_method: item.admin_method,
      scheduled_date: dateStr(scheduledDate),
      status: isPast && !isActive ? 'completed' : isPast ? 'completed' : 'scheduled',
      completed_date: isPast ? dateStr(addDays(scheduledDate, randInt(0, 1))) : null,
      verified_by_tech_id: isPast ? technician.id : null,
    }
  })

  await batchInsert('vaccination_schedules', vaccinationRows)

  // ── Daily Logs + Performance Metrics ─────────────────────────────────────

  const daysToLog = isActive ? Math.floor((new Date().getTime() - startDate.getTime()) / 86400000) : CYCLE_DAYS
  let currentBirds = INITIAL_BIRDS
  let cumulativeFeedKg = 0
  let cumulativeMortality = 0
  let cumulativeCulls = 0

  const dailyLogIds: string[] = []
  const fcr = rand(ctx.fcrBase - ctx.fcrVariance, ctx.fcrBase + ctx.fcrVariance)
  const targetFinalWeightG = rand(2000, 2200)

  for (let day = 0; day < daysToLog; day++) {
    const logDate = addDays(startDate, day)

    // Bird age determines feed amounts (starter: 0-14, grower: 15-28, finisher: 29+)
    const ageDay = day + 1
    const feedPerBirdG = ageDay <= 14 ? rand(18, 28) : ageDay <= 28 ? rand(75, 95) : rand(140, 165)
    const feedUsedKg = round3((currentBirds * feedPerBirdG) / 1000)

    // Mortality: random daily deaths
    const dailyMortalityRate = rand(ctx.mortalityBase - ctx.mortalityVariance, ctx.mortalityBase + ctx.mortalityVariance)
    const mortalityCount = Math.max(0, Math.round(currentBirds * dailyMortalityRate))
    const quarantinedCount = day % 3 === 0 ? randInt(0, 3) : 0
    const culledCount = day % 5 === 0 && quarantinedCount > 0 ? randInt(0, quarantinedCount) : 0

    // Expected weight gain (linear approximation)
    const avgWeightG = round2((targetFinalWeightG / CYCLE_DAYS) * ageDay * rand(0.97, 1.03))

    // Sensor-like environment data
    const avgTempC = round2(rand(28, 34))
    const avgHumidityPct = round2(rand(55, 75))
    const avgCo2Ppm = round2(rand(800, 1800))
    const avgAmmoniaPpm = round2(rand(5, 18))

    // Grower entry
    const growerLog = await singleInsert('daily_logs', {
      org_id: ctx.org.id,
      cycle_id: cycle.id,
      log_date: dateStr(logDate),
      mortality_count: mortalityCount,
      quarantined_count: quarantinedCount,
      culled_count: culledCount,
      feed_used_kg: feedUsedKg,
      water_used_liters: round2(feedUsedKg * rand(1.8, 2.2)),
      water_temp_celsius: round2(rand(22, 30)),
      avg_weight_g: avgWeightG,
      avg_temp_c: avgTempC,
      avg_humidity_pct: avgHumidityPct,
      avg_co2_ppm: avgCo2Ppm,
      avg_ammonia_ppm: avgAmmoniaPpm,
      submitted_by: grower.id,
      entry_type: 'grower_entry',
      status: 'submitted',
    })

    dailyLogIds.push(growerLog.id)
    cumulativeFeedKg += feedUsedKg
    cumulativeMortality += mortalityCount
    cumulativeCulls += culledCount
    currentBirds = Math.max(0, currentBirds - mortalityCount - culledCount)

    // Performance metrics
    const livabilityPct = round4((currentBirds) / INITIAL_BIRDS)
    const fcrToDate = cumulativeFeedKg > 0 && avgWeightG > 0
      ? round4(cumulativeFeedKg / (currentBirds * (avgWeightG / 1000)))
      : null
    const avgDailyGainG = round3(avgWeightG / ageDay)
    const waterToFeedRatio = round4((feedUsedKg * rand(1.8, 2.2)) / feedUsedKg)

    await singleInsert('performance_metrics', {
      org_id: ctx.org.id,
      daily_log_id: growerLog.id,
      cycle_id: cycle.id,
      fcr_to_date: fcrToDate,
      water_to_feed_ratio: waterToFeedRatio,
      livability_pct: livabilityPct,
      avg_daily_gain_g: avgDailyGainG,
      uniformity_pct: round2(rand(82, 96)),
    })

    // Technician entry once a week (day 6, 13, 20, 27, 34, 41)
    if (day % 7 === 6) {
      const techLog = await singleInsert('daily_logs', {
        org_id: ctx.org.id,
        cycle_id: cycle.id,
        log_date: dateStr(logDate),
        mortality_count: mortalityCount,
        quarantined_count: quarantinedCount,
        culled_count: culledCount,
        feed_used_kg: feedUsedKg,
        water_used_liters: round2(feedUsedKg * rand(1.8, 2.2)),
        avg_weight_g: round2(avgWeightG * rand(0.98, 1.02)),
        avg_temp_c: avgTempC,
        avg_humidity_pct: avgHumidityPct,
        avg_co2_ppm: avgCo2Ppm,
        avg_ammonia_ppm: avgAmmoniaPpm,
        submitted_by: technician.id,
        entry_type: 'technician_entry',
        status: 'submitted',
      })

      // Weekly log review
      const weekStart = addDays(logDate, -6)
      await singleInsert('weekly_log_reviews', {
        org_id: ctx.org.id,
        cycle_id: cycle.id,
        technician_id: technician.id,
        review_date: dateStr(logDate),
        week_start_date: dateStr(weekStart),
        week_end_date: dateStr(logDate),
        has_discrepancy: false,
        status: 'reviewed',
        blocks_cycle_completion: false,
      })
    }
  }

  // Stop here if cycle is still active
  if (isActive) {
    return { cycleId: cycle.id, endDate: addDays(startDate, CYCLE_DAYS), netPayout: 0, epefScore: 0 }
  }

  // ── Delivered Inputs (feed + medicine) ────────────────────────────────────

  const feedCostPerKg = round2(rand(38, 43))
  const totalFeedDeliveredKg = round3(cumulativeFeedKg * rand(1.02, 1.08))
  const feedInputTotal = round2(totalFeedDeliveredKg * feedCostPerKg)

  const feedInput = await singleInsert('delivered_inputs', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    farm_id: farm.id,
    item_name: 'Complete Broiler Feed',
    item_type: 'feed',
    quantity_delivered: totalFeedDeliveredKg,
    unit: 'kg',
    cost_per_unit: feedCostPerKg,
    delivery_date: dateStr(addDays(startDate, 3)),
    received_by: grower.id,
  })

  const medicineQty = round2(rand(200, 400))
  const medicineCostPerUnit = round2(rand(1.5, 3.0))
  const medicineInput = await singleInsert('delivered_inputs', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    farm_id: farm.id,
    item_name: 'Veterinary Biologics Package',
    item_type: 'medicine',
    quantity_delivered: medicineQty,
    unit: 'dose',
    cost_per_unit: medicineCostPerUnit,
    delivery_date: dateStr(addDays(startDate, 1)),
    received_by: technician.id,
  })

  // ── Health Records ────────────────────────────────────────────────────────

  await singleInsert('health_records', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    record_type: 'inspection',
    subject: 'Routine Flock Health Inspection - Week 2',
    record_date: dateStr(addDays(startDate, 14)),
    is_gahp_compliant: true,
    gahp_standard_ref: 'PNS/BAFS 184:2016',
    notes: 'Flock appears healthy. Uniform growth. No signs of respiratory disease.',
    submitted_by: technician.id,
  })

  await singleInsert('health_records', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    record_type: 'vaccination',
    subject: 'ND Vaccination - Day 7',
    record_date: dateStr(addDays(startDate, 7)),
    veterinarian_id: technician.id,
    is_gahp_compliant: true,
    gahp_standard_ref: 'PNS/BAFS 184:2016',
    notes: 'ND live vaccine administered via eye drop. No adverse reactions observed.',
    submitted_by: technician.id,
  })

  // ── Cash Advance (grower, at DOC placement) ───────────────────────────────

  const advanceAmount = round2(rand(3000, 6000))
  const cashAdvance = await singleInsert('cash_advance_requests', {
    org_id: ctx.org.id,
    employee_id: grower.id,
    requester_type: 'grower',
    cycle_id: cycle.id,
    amount: advanceAmount,
    reason: 'Operating cash advance at DOC placement',
    request_date: dateStr(addDays(startDate, 0)),
    status: 'deducted',
    approved_by: ctx.admin.id,
    approved_at: addDays(startDate, 1).toISOString(),
  })

  // Financial ledger: cash advance outflow
  await singleInsert('financial_ledger', {
    org_id: ctx.org.id,
    transaction_type: 'cash_advance',
    description: `Cash advance - ${grower.first_name} ${grower.last_name} - ${cycle.batch_name}`,
    amount: -advanceAmount,
    status: 'paid',
    advance_id: cashAdvance.id,
    created_by: ctx.admin.id,
    created_at: addDays(startDate, 1).toISOString(),
  })

  // ── Cycle Expenses ────────────────────────────────────────────────────────

  const expenseCats = ctx.expenseCategories
  const utilitiesCat = expenseCats.find(c => c.name === 'Utilities')
  const operationsCat = expenseCats.find(c => c.name === 'Operations')
  const transportCat = expenseCats.find(c => c.name === 'Transportation')

  const expensesToCreate = [
    { category_id: utilitiesCat?.id,   description: 'Electricity - brooder heating weeks 1-2', amount: round2(rand(2500, 4000)) },
    { category_id: operationsCat?.id,  description: 'Litter material (rice hull)',               amount: round2(rand(1800, 3000)) },
    { category_id: transportCat?.id,   description: 'Feed delivery transport',                   amount: round2(rand(800, 1500))  },
  ]

  const createdExpenses: any[] = []
  for (const exp of expensesToCreate) {
    if (!exp.category_id) continue
    const vatAmount = round2(exp.amount * 0)    // grower services VAT exempt
    const ewtRate   = 0.02
    const ewtAmount = round2(exp.amount * ewtRate)
    const totalPaid = round2(exp.amount - ewtAmount)

    const expense = await singleInsert('cycle_expenses', {
      org_id: ctx.org.id,
      cycle_id: cycle.id,
      farm_id: farm.id,
      category_id: exp.category_id,
      description: exp.description,
      amount_excl_vat: exp.amount,
      vat_amount: vatAmount,
      ewt_rate: ewtRate,
      ewt_amount: ewtAmount,
      total_paid: totalPaid,
      status: 'approved',
      submitted_by: ctx.technicians[0].id,
      approved_by: ctx.admin.id,
      approved_at: addDays(startDate, 7).toISOString(),
    })

    createdExpenses.push(expense)

    // Financial ledger: expense outflow
    await singleInsert('financial_ledger', {
      org_id: ctx.org.id,
      transaction_type: 'expense',
      description: exp.description,
      amount: -totalPaid,
      status: 'paid',
      expense_id: expense.id,
      created_by: ctx.admin.id,
      created_at: addDays(startDate, 8).toISOString(),
    })
  }

  // ── Harvest Log ───────────────────────────────────────────────────────────

  const birdsHarvested = currentBirds - randInt(50, 150)  // loading loss
  const loadingLoss = currentBirds - birdsHarvested
  const finalAvgWeightG = round2(rand(1900, 2200))
  const grossWeightKg = round3((birdsHarvested * finalAvgWeightG) / 1000)
  const rejectWeightKg = round3(grossWeightKg * rand(0.005, 0.015))
  const netSoldWeightKg = round3(grossWeightKg - rejectWeightKg)

  const harvestLog = await singleInsert('harvest_logs', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    harvest_date_start: dateStr(harvestDate!),
    harvest_date_completion: dateStr(harvestDate!),
    birds_harvested_count: birdsHarvested,
    birds_rejected_count: randInt(10, 40),
    loading_loss_count: loadingLoss,
    gross_weight_kg: grossWeightKg,
    reject_weight_kg: rejectWeightKg,
    net_sold_weight_kg: netSoldWeightKg,
    fleet_used: 'Company truck',
    truck_plate_numbers: [`XYZ-${randInt(100, 999)}`],
    technician_in_charge_id: technician.id,
    buyer_representative_name: 'Juan Dela Cruz',
    nmis_compliant: true,
    nmis_cert_no: `NMIS-${cycle.id.slice(0, 8).toUpperCase()}`,
    is_validated: true,
    validated_by: ctx.admin.id,
    validated_at: addDays(harvestDate!, 1).toISOString(),
  })

  // ── Harvest Performance (computed from actual log totals) ─────────────────

  const finalFcr = round4(cumulativeFeedKg / (birdsHarvested * (finalAvgWeightG / 1000)))
  const finalLivabilityPct = round4(birdsHarvested / INITIAL_BIRDS)
  const avgDailyGainG = round3(finalAvgWeightG / CYCLE_DAYS)
  const epefScore = computeEpef(avgDailyGainG, finalLivabilityPct, finalFcr)
  const bpiScore = computeBpi(finalAvgWeightG / 1000, finalLivabilityPct, CYCLE_DAYS, finalFcr)
  const epefBracket = getEpefBracket(epefScore, ctx.epefBrackets)
  const bpiBracket = getBpiBracket(bpiScore, ctx.bpiBrackets)

  await singleInsert('harvest_performance', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    days_in_house: CYCLE_DAYS,
    final_avg_weight_g: finalAvgWeightG,
    // These two values ARE the sum of daily logs — guaranteed integrity
    total_feed_consumed_kg: round3(cumulativeFeedKg),
    total_feed_delivered_kg: totalFeedDeliveredKg,
    excess_feed_kg: round3(totalFeedDeliveredKg - cumulativeFeedKg),
    final_fcr: finalFcr,
    final_livability_pct: finalLivabilityPct,
    total_mortality_count: cumulativeMortality,
    total_culls_count: cumulativeCulls,
    avg_daily_gain_g: avgDailyGainG,
    epef_score: epefScore,
    bpi_score: bpiScore,
    epef_bracket_id: epefBracket?.id || null,
    bpi_bracket_id: bpiBracket?.id || null,
  })

  // ── Harvest Sale + Payment ────────────────────────────────────────────────

  // Get market price near harvest date
  const { data: mktPrice } = await supabase
    .from('market_prices')
    .select('farmgate_price_per_kg')
    .eq('org_id', ctx.org.id)
    .eq('region', 'Region X')
    .lte('price_date', dateStr(harvestDate!))
    .order('price_date', { ascending: false })
    .limit(1)
    .single()

  const pricePerKg = mktPrice?.farmgate_price_per_kg ?? 115
  const grossRevenue = round2(netSoldWeightKg * pricePerKg)
  const rejectDeductions = round2(rejectWeightKg * pricePerKg * 0.3)
  const netRevenue = round2(grossRevenue - rejectDeductions)

  const paymentDate = addDays(harvestDate!, 30)
  const sale = await singleInsert('harvest_sales', {
    org_id: ctx.org.id,
    harvest_id: harvestLog.id,
    cycle_id: cycle.id,
    buyer_name: 'Cagayan de Oro Poultry Buyers Cooperative',
    channel: 'b2b_wholesale',
    total_head_count: birdsHarvested,
    total_weight_kg: netSoldWeightKg,
    price_per_kg_actual: pricePerKg,
    gross_revenue: grossRevenue,
    reject_deductions: rejectDeductions,
    net_revenue: netRevenue,
    payment_status: 'paid',
    expected_payment_date: dateStr(paymentDate),
    actual_payment_date: dateStr(paymentDate),
  })

  // Payment schedule (single payment, paid)
  const paymentSchedule = await singleInsert('sale_payment_schedules', {
    org_id: ctx.org.id,
    sale_id: sale.id,
    due_date: dateStr(paymentDate),
    amount_due: netRevenue,
    amount_paid: netRevenue,
    payment_date: dateStr(paymentDate),
    status: 'paid',
  })

  // Financial ledger: sale payment inflow
  await singleInsert('financial_ledger', {
    org_id: ctx.org.id,
    transaction_type: 'sale_payment',
    description: `Sale payment - ${cycle.batch_name} - ${sale.buyer_name}`,
    amount: netRevenue,
    status: 'paid',
    payment_id: paymentSchedule.id,
    created_by: ctx.admin.id,
    created_at: paymentDate.toISOString(),
  })

  // ── Settlement Statement ──────────────────────────────────────────────────

  const growerFeeRatePerKg = round4(rand(8, 11))
  const growerFeeTotal = round2(netSoldWeightKg * growerFeeRatePerKg)

  // Deductions: feed input + medicine input + cash advance
  const feedDeductionAmount = round2(totalFeedDeliveredKg * feedCostPerKg)
  const medicineDeductionAmount = round2(medicineQty * medicineCostPerUnit)

  const totalDeductions = round2(feedDeductionAmount + medicineDeductionAmount + advanceAmount)
  const ewtRate = growerCumulativePayment + growerFeeTotal > 300000 ? 0.05 : 0
  const ewtAmount = round2(growerFeeTotal * ewtRate)
  const finalNetPayout = round2(growerFeeTotal - totalDeductions - ewtAmount)

  const settlement = await singleInsert('settlement_statements', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    grower_id: grower.id,
    farm_id: farm.id,
    total_live_weight_kg: netSoldWeightKg,
    sale_price_per_kg: pricePerKg,
    total_production_value: netRevenue,
    grower_fee_rate_per_kg: growerFeeRatePerKg,
    grower_fee_total: growerFeeTotal,
    total_deductions: totalDeductions,
    final_net_payout: finalNetPayout,
    ewt_rate: ewtRate,
    ewt_amount: ewtAmount,
    bir_form_type: ewtRate > 0 ? '2307' : '2304',
    cumulative_annual_payment: round2(growerCumulativePayment + growerFeeTotal),
    status: 'issued',
    verified_by: ctx.admin.id,
    verified_at: addDays(harvestDate!, 5).toISOString(),
    issued_by: ctx.admin.id,
    issued_at: addDays(harvestDate!, 7).toISOString(),
    notes: 'Verified and issued after buyer payment confirmation.',
  })

  // Settlement deductions (must sum to totalDeductions)
  await batchInsert('settlement_deductions', [
    {
      org_id: ctx.org.id,
      statement_id: settlement.id,
      description: 'Feed inventory - Complete Broiler Feed',
      category: 'feed_inventory',
      amount: feedDeductionAmount,
      reference_id: feedInput.id,
      is_auto_computed: true,
    },
    {
      org_id: ctx.org.id,
      statement_id: settlement.id,
      description: 'Medical/biologics - Veterinary Biologics Package',
      category: 'medical_health',
      amount: medicineDeductionAmount,
      reference_id: medicineInput.id,
      is_auto_computed: true,
    },
    {
      org_id: ctx.org.id,
      statement_id: settlement.id,
      description: 'Cash advance deduction - DOC placement',
      category: 'cash_advance',
      amount: advanceAmount,
      reference_id: cashAdvance.id,
      is_auto_computed: true,
    },
  ])

  // Financial ledger: settlement payout outflow
  await singleInsert('financial_ledger', {
    org_id: ctx.org.id,
    transaction_type: 'settlement',
    description: `Settlement payout - ${grower.first_name} ${grower.last_name} - ${cycle.batch_name}`,
    amount: -finalNetPayout,
    status: 'paid',
    settlement_id: settlement.id,
    created_by: ctx.admin.id,
    created_at: addDays(harvestDate!, 8).toISOString(),
  })

  // ── Grower Performance Record ─────────────────────────────────────────────

  const performanceYear = startDate.getFullYear()
  const { basePoints, fcrBonusPoints, mortalityBonusPoints, cycleCompletionPoints, consistencyBonusPoints, totalPoints } =
    computePoints(epefScore, finalFcr, 1 - finalLivabilityPct, epefScore * 0.95, Math.random() > 0.5)

  await singleInsert('grower_performance', {
    org_id: ctx.org.id,
    cycle_id: cycle.id,
    grower_id: grower.id,
    performance_year: performanceYear,
    epef_score: epefScore,
    bpi_score: bpiScore,
    final_fcr: finalFcr,
    final_mortality_rate: round4(1 - finalLivabilityPct),
    days_in_house: CYCLE_DAYS,
    total_birds_placed: INITIAL_BIRDS,
    total_birds_harvested: birdsHarvested,
    total_feed_delivered_kg: totalFeedDeliveredKg,
    total_feed_consumed_kg: round3(cumulativeFeedKg),
    excess_feed_kg: round3(totalFeedDeliveredKg - cumulativeFeedKg),
    average_harvest_weight_kg: round3(finalAvgWeightG / 1000),
    base_points: basePoints,
    fcr_bonus_points: fcrBonusPoints,
    mortality_bonus_points: mortalityBonusPoints,
    cycle_completion_points: cycleCompletionPoints,
    consistency_bonus_points: consistencyBonusPoints,
    total_points: totalPoints,
    epef_bracket_id: epefBracket?.id || null,
    bpi_bracket_id: bpiBracket?.id || null,
  })

  return {
    cycleId: cycle.id,
    endDate,
    netPayout: finalNetPayout,
    epefScore,
  }
}

// ── Payroll ───────────────────────────────────────────────────────────────────

async function seedPayroll(ctx: OrgContext, yearAgo: Date) {
  console.log(`  Seeding payroll for ${ctx.org.name}...`)

  const payrollEmployees = [...ctx.technicians, ...ctx.org.admins || []]
  // Re-fetch admins properly
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', ctx.org.id)
    .in('role', ['admin', 'technician'])

  if (!allProfiles?.length) return

  for (let month = 0; month < 12; month++) {
    const periodStart = new Date(yearAgo.getFullYear(), yearAgo.getMonth() + month, 1)
    const periodEnd = new Date(yearAgo.getFullYear(), yearAgo.getMonth() + month + 1, 0)
    const paidAt = new Date(yearAgo.getFullYear(), yearAgo.getMonth() + month + 1, 5)

    for (const employee of allProfiles) {
      const basePay = employee.base_pay || 22000
      const allowance = employee.monthly_allowance || 2000

      // SSS: ~5% employee, PhilHealth: ~5%, Pag-IBIG: 100 fixed
      const sssEmployee = round2(basePay * 0.045)
      const philhealthEmployee = round2(basePay * 0.025)
      const pagibig = 100
      const totalDeductions = round2(sssEmployee + philhealthEmployee + pagibig)
      const totalGross = round2(basePay + allowance)
      const netPayout = round2(totalGross - totalDeductions)

      const payout = await singleInsert('payroll_payouts', {
        org_id: ctx.org.id,
        user_id: employee.id,
        pay_period_start: dateStr(periodStart),
        pay_period_end: dateStr(periodEnd),
        base_pay: basePay,
        monthly_allowance: allowance,
        other_bonuses: 0,
        total_gross_payout: totalGross,
        total_deductions: totalDeductions,
        net_payout: netPayout,
        payment_status: 'paid',
        paid_at: paidAt.toISOString(),
      })

      // Deductions breakdown
      await batchInsert('payroll_deductions_breakdown', [
        { org_id: ctx.org.id, payout_id: payout.id, deduction_type: 'sss',        amount: sssEmployee,        employer_share: round2(basePay * 0.095), is_statutory: true },
        { org_id: ctx.org.id, payout_id: payout.id, deduction_type: 'philhealth', amount: philhealthEmployee,  employer_share: round2(basePay * 0.025), is_statutory: true },
        { org_id: ctx.org.id, payout_id: payout.id, deduction_type: 'pagibig',    amount: pagibig,             employer_share: 100,                     is_statutory: true },
      ])

      // Financial ledger: payroll outflow
      await singleInsert('financial_ledger', {
        org_id: ctx.org.id,
        transaction_type: 'payroll',
        description: `Payroll - ${employee.first_name} ${employee.last_name} - ${periodStart.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        amount: -netPayout,
        status: 'paid',
        payroll_id: payout.id,
        created_by: ctx.admin.id,
        created_at: paidAt.toISOString(),
      })
    }
  }

  console.log(`  ✓ Payroll complete for ${ctx.org.name}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed-mock-data...\n')
  console.log('⚠️  This will take several minutes. Do not interrupt.\n')

  const now = new Date()
  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  // Load contexts for both orgs
  console.log('Loading org contexts...')
  const ctxOrg1 = await loadOrgContext('sunrise-poultry', true)
  const ctxOrg2 = await loadOrgContext('golden-harvest', false)
  console.log('  ✓ Contexts loaded\n')

  // Process each org
  for (const ctx of [ctxOrg1, ctxOrg2]) {
    console.log(`\n━━━━ ${ctx.org.name} ━━━━`)

    // Process each farm
    for (let fi = 0; fi < ctx.farms.length; fi++) {
      const farm = ctx.farms[fi]

      // Find assigned grower and technician for this farm
      const techAssignment = ctx.farmAssignments.find(
        a => a.farm_id === farm.id && a.role === 'technician'
      )
      const growerAssignment = ctx.farmAssignments.find(
        a => a.farm_id === farm.id && a.role === 'grower'
      )

      if (!techAssignment || !growerAssignment) {
        console.warn(`  ⚠️  Skipping ${farm.name} - missing assignment`)
        continue
      }

      const technician = ctx.technicians.find(t => t.id === techAssignment.user_id)
      const grower = ctx.growers.find(g => g.id === growerAssignment.user_id)

      if (!technician || !grower) {
        console.warn(`  ⚠️  Skipping ${farm.name} - profile not found`)
        continue
      }

      console.log(`\n  Farm: ${farm.name}`)
      console.log(`    Grower: ${grower.email}, Technician: ${technician.email}`)

      // Generate cycles: 42 days on, 7 days off, repeating from yearAgo
      // Last cycle is active (started within last 42 days)
      let cycleStart = new Date(yearAgo)
      let batchNum = 1
      let growerCumulativePayment = 0
      const CYCLE_LENGTH = 42
      const DOWNTIME = 7

      while (true) {
        const cycleEnd = addDays(cycleStart, CYCLE_LENGTH)
        const nextCycleStart = addDays(cycleEnd, DOWNTIME)
        const isActive = cycleEnd >= now

        if (cycleStart >= now) break  // Don't start future cycles

        process.stdout.write(`    Cycle ${batchNum} (${dateStr(cycleStart)})... `)

        const result = await seedCycle(
          ctx,
          farm,
          grower,
          technician,
          cycleStart,
          batchNum,
          isActive,
          growerCumulativePayment
        )

        growerCumulativePayment += result.netPayout
        console.log(`✓ EPEF: ${result.epefScore}`)

        if (isActive) break

        cycleStart = nextCycleStart
        batchNum++
      }
    }

    // Payroll for this org
    console.log('')
    await seedPayroll(ctx, yearAgo)
  }

  // ── Final verification summary ─────────────────────────────────────────────

  console.log('\n─────────────────────────────────────────────')
  console.log('✓ seed-mock-data complete')
  console.log('\nRow counts:')

  const tables = [
    'production_cycles', 'daily_logs', 'performance_metrics',
    'vaccination_schedules', 'health_records', 'delivered_inputs',
    'harvest_logs', 'harvest_performance', 'harvest_sales',
    'sale_payment_schedules', 'settlement_statements', 'settlement_deductions',
    'cash_advance_requests', 'cycle_expenses', 'grower_performance',
    'payroll_payouts', 'payroll_deductions_breakdown', 'financial_ledger',
  ]

  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`  ${table.padEnd(30)} ${count ?? '?'}`)
  }

  console.log('\nRun the verification queries from the implementation plan to confirm data integrity.')
  console.log('─────────────────────────────────────────────')
}

main().catch(err => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
