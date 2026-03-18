/**
 * seed-schema.ts
 * FlockMate — Structural Seed Script
 *
 * Creates:
 *   - 2 organizations
 *   - 16 auth accounts (8 per org) with password123
 *   - 16 profiles linked to those accounts
 *   - 16 org_members
 *   - 8 farms (4 per org, Region X)
 *   - 16 farm_assignments (tech: 2 farms each, grower: 1 farm each)
 *   - EPEF + BPI incentive brackets per org
 *   - 12 months of weekly market prices for Region X
 *   - Inventory catalog per org
 *   - Sensor nodes per farm
 *
 * Usage:
 *   npx tsx scripts/seed-schema.ts
 *
 * Requirements:
 *   .env.local must contain:
 *     SUPABASE_URL=https://your-project-ref.supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── Config & Client ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function dateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

async function mustInsert<T extends object>(
  table: string,
  data: T | T[],
  label: string
): Promise<T[]> {
  const { data: rows, error } = await supabase
    .from(table)
    .insert(data as any)
    .select()
  if (error) {
    console.error(`❌ Failed inserting into ${table} (${label}):`, error.message)
    process.exit(1)
  }
  return rows as T[]
}

// ── Cleanup (idempotent re-run support) ───────────────────────────────────────

async function cleanup() {
  console.log('🧹 Cleaning up previous seed data...')

  // First, find org IDs for our seed orgs
  const { data: existingOrgs } = await supabase
    .from('organizations')
    .select('id')
    .in('slug', ['sunrise-poultry', 'golden-harvest'])

  const orgIds = existingOrgs?.map(o => o.id) ?? []

  if (orgIds.length > 0) {
    // Delete child tables first (FK order: deepest children → parents)
    // Level 4+ (deepest children)
    await supabase.from('sensor_readings').delete().in('org_id', orgIds)
    await supabase.from('sensor_alerts').delete().in('org_id', orgIds)
    await supabase.from('sensor_node_metrics').delete().match({}).in('node_id',
      (await supabase.from('sensor_nodes').select('id').in('org_id', orgIds)).data?.map(n => n.id) ?? []
    )
    await supabase.from('alert_thresholds').delete().in('org_id', orgIds)
    await supabase.from('sensor_nodes').delete().in('org_id', orgIds)
    await supabase.from('inventory_stock_ledger').delete().in('org_id', orgIds)
    await supabase.from('inventory_stock').delete().in('org_id', orgIds)
    await supabase.from('inventory_order_items').delete().match({}).in('order_id',
      (await supabase.from('inventory_orders').select('id').in('org_id', orgIds)).data?.map(o => o.id) ?? []
    )
    await supabase.from('inventory_orders').delete().in('org_id', orgIds)
    await supabase.from('inventory_items').delete().in('org_id', orgIds)
    await supabase.from('payroll_deductions_breakdown').delete().in('org_id', orgIds)
    await supabase.from('payroll_payouts').delete().in('org_id', orgIds)
    await supabase.from('settlement_deductions').delete().in('org_id', orgIds)
    await supabase.from('settlement_statements').delete().in('org_id', orgIds)
    await supabase.from('sale_payment_schedules').delete().in('org_id', orgIds)
    await supabase.from('harvest_sales').delete().in('org_id', orgIds)
    await supabase.from('harvest_performance').delete().in('org_id', orgIds)
    await supabase.from('harvest_logs').delete().in('org_id', orgIds)
    await supabase.from('grower_performance').delete().in('org_id', orgIds)
    await supabase.from('financial_ledger').delete().in('org_id', orgIds)
    await supabase.from('cash_advance_requests').delete().in('org_id', orgIds)
    await supabase.from('medication_logs').delete().in('org_id', orgIds)
    await supabase.from('vaccination_schedules').delete().in('org_id', orgIds)
    await supabase.from('health_records').delete().in('org_id', orgIds)
    await supabase.from('performance_metrics').delete().in('org_id', orgIds)
    await supabase.from('weekly_log_reviews').delete().in('org_id', orgIds)
    await supabase.from('daily_logs').delete().in('org_id', orgIds)
    await supabase.from('delivered_inputs').delete().in('org_id', orgIds)
    await supabase.from('doc_loading').delete().in('org_id', orgIds)
    await supabase.from('cycle_expenses').delete().in('org_id', orgIds)
    await supabase.from('production_cycles').delete().in('org_id', orgIds)
    await supabase.from('downtime_checklist').delete().in('org_id', orgIds)
    await supabase.from('farm_audit_logs').delete().in('org_id', orgIds)
    await supabase.from('farm_assignments').delete().in('org_id', orgIds)
    await supabase.from('farms').delete().in('org_id', orgIds)
    await supabase.from('market_prices').delete().in('org_id', orgIds)
    await supabase.from('notifications').delete().in('org_id', orgIds)
    await supabase.from('bpi_incentive_brackets').delete().in('org_id', orgIds)
    await supabase.from('epef_incentive_brackets').delete().in('org_id', orgIds)
    await supabase.from('org_invitations').delete().in('org_id', orgIds)
    await supabase.from('org_settings').delete().in('org_id', orgIds)
    await supabase.from('suppliers').delete().in('org_id', orgIds)
    // Level 1: org_members + profiles
    await supabase.from('org_members').delete().in('org_id', orgIds)
    await supabase.from('profiles').delete().in('org_id', orgIds)
  }

  // Delete auth users by email pattern
  const emails = [
    ...['admin1', 'admin2', 'technician1', 'technician2',
      'grower1', 'grower2', 'grower3', 'grower4'].map(r => `${r}@org1.flockmate.com`),
    ...['admin1', 'admin2', 'technician1', 'technician2',
      'grower1', 'grower2', 'grower3', 'grower4'].map(r => `${r}@org2.flockmate.com`),
  ]

  for (const email of emails) {
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email)
    if (user) {
      await supabase.auth.admin.deleteUser(user.id)
    }
  }

  // Finally delete the organizations themselves
  await supabase.from('organizations').delete().in('slug', ['sunrise-poultry', 'golden-harvest'])

  console.log('  ✓ Cleanup complete')
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed-schema...\n')

  await cleanup()

  // ── Step 1: Organizations ────────────────────────────────────────────────

  console.log('Step 1: Creating organizations...')

  const orgsData = [
    {
      name: 'Sunrise Poultry Integrators',
      slug: 'sunrise-poultry',
      plan: 'pro',
      billing_email: 'billing@sunrise-poultry.com',
      billing_status: 'active',
      region: 'Region X',
      address: 'Purok 3, Barangay Bulua, Cagayan de Oro City, Misamis Oriental',
      contact_number: '088-123-4567',
      is_active: true,
    },
    {
      name: 'Golden Harvest Farms',
      slug: 'golden-harvest',
      plan: 'starter',
      billing_email: 'billing@goldenharvest.com',
      billing_status: 'active',
      region: 'Region X',
      address: 'Purok 5, Barangay Indahag, Cagayan de Oro City, Misamis Oriental',
      contact_number: '088-234-5678',
      is_active: true,
    },
  ]

  const orgs = await mustInsert('organizations', orgsData, 'organizations')
  const org1 = orgs[0]
  const org2 = orgs[1]
  console.log(`  ✓ Created: ${org1.name} (${org1.id})`)
  console.log(`  ✓ Created: ${org2.name} (${org2.id})`)

  // Note: org_settings rows are auto-created by the trg_create_org_settings trigger

  // ── Step 2: Auth Accounts + Profiles ────────────────────────────────────

  console.log('\nStep 2: Creating auth accounts and profiles...')

  interface AccountDef {
    email: string
    role: 'admin' | 'technician' | 'grower'
    org: typeof org1
    orgNum: number
    roleNum: number
    firstName: string
    lastName: string
    employmentType: 'full_time' | 'contractual'
    basePay: number
    monthlyAllowance: number
  }

  const accountDefs: AccountDef[] = [
    // Org 1 accounts
    { email: 'admin1@org1.flockmate.com', role: 'admin', org: org1, orgNum: 1, roleNum: 1, firstName: 'Admin', lastName: 'One', employmentType: 'full_time', basePay: 35000, monthlyAllowance: 3000 },
    { email: 'admin2@org1.flockmate.com', role: 'admin', org: org1, orgNum: 1, roleNum: 2, firstName: 'Admin', lastName: 'Two', employmentType: 'full_time', basePay: 35000, monthlyAllowance: 3000 },
    { email: 'technician1@org1.flockmate.com', role: 'technician', org: org1, orgNum: 1, roleNum: 1, firstName: 'Tech', lastName: 'One', employmentType: 'full_time', basePay: 22000, monthlyAllowance: 2000 },
    { email: 'technician2@org1.flockmate.com', role: 'technician', org: org1, orgNum: 1, roleNum: 2, firstName: 'Tech', lastName: 'Two', employmentType: 'full_time', basePay: 22000, monthlyAllowance: 2000 },
    { email: 'grower1@org1.flockmate.com', role: 'grower', org: org1, orgNum: 1, roleNum: 1, firstName: 'Grower', lastName: 'One', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
    { email: 'grower2@org1.flockmate.com', role: 'grower', org: org1, orgNum: 1, roleNum: 2, firstName: 'Grower', lastName: 'Two', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
    { email: 'grower3@org1.flockmate.com', role: 'grower', org: org1, orgNum: 1, roleNum: 3, firstName: 'Grower', lastName: 'Three', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
    { email: 'grower4@org1.flockmate.com', role: 'grower', org: org1, orgNum: 1, roleNum: 4, firstName: 'Grower', lastName: 'Four', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
    // Org 2 accounts
    { email: 'admin1@org2.flockmate.com', role: 'admin', org: org2, orgNum: 2, roleNum: 1, firstName: 'Admin', lastName: 'One', employmentType: 'full_time', basePay: 35000, monthlyAllowance: 3000 },
    { email: 'admin2@org2.flockmate.com', role: 'admin', org: org2, orgNum: 2, roleNum: 2, firstName: 'Admin', lastName: 'Two', employmentType: 'full_time', basePay: 35000, monthlyAllowance: 3000 },
    { email: 'technician1@org2.flockmate.com', role: 'technician', org: org2, orgNum: 2, roleNum: 1, firstName: 'Tech', lastName: 'One', employmentType: 'full_time', basePay: 22000, monthlyAllowance: 2000 },
    { email: 'technician2@org2.flockmate.com', role: 'technician', org: org2, orgNum: 2, roleNum: 2, firstName: 'Tech', lastName: 'Two', employmentType: 'full_time', basePay: 22000, monthlyAllowance: 2000 },
    { email: 'grower1@org2.flockmate.com', role: 'grower', org: org2, orgNum: 2, roleNum: 1, firstName: 'Grower', lastName: 'One', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
    { email: 'grower2@org2.flockmate.com', role: 'grower', org: org2, orgNum: 2, roleNum: 2, firstName: 'Grower', lastName: 'Two', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
    { email: 'grower3@org2.flockmate.com', role: 'grower', org: org2, orgNum: 2, roleNum: 3, firstName: 'Grower', lastName: 'Three', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
    { email: 'grower4@org2.flockmate.com', role: 'grower', org: org2, orgNum: 2, roleNum: 4, firstName: 'Grower', lastName: 'Four', employmentType: 'contractual', basePay: 0, monthlyAllowance: 0 },
  ]

  const createdProfiles: any[] = []

  for (const def of accountDefs) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: def.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        first_name: def.firstName,
        last_name: def.lastName,
        role: def.role,
      },
    })

    if (authError || !authData.user) {
      console.error(`❌ Failed creating auth user ${def.email}:`, authError?.message)
      process.exit(1)
    }

    const userId = authData.user.id

    // Upsert profile (the auth trigger may have already created a stub row)
    const staffPrefix = def.role === 'admin' ? 'ADM' : def.role === 'technician' ? 'TECH' : 'GRW'
    const staffCode = `${staffPrefix}-ORG${def.orgNum}-${String(def.roleNum).padStart(3, '0')}`

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        org_id: def.org.id,
        staff_id_code: staffCode,
        first_name: def.firstName,
        last_name: def.lastName,
        email: def.email,
        role: def.role,
        employment_type: def.employmentType,
        base_pay: def.basePay,
        monthly_allowance: def.monthlyAllowance,
        statutory_deductions_enabled: def.role !== 'grower',
        force_password_change: false,
        status: 'active',
      })
      .select()
      .single()

    if (profileError || !profile) {
      console.error(`❌ Failed upserting profile for ${def.email}:`, profileError?.message)
      process.exit(1)
    }

    createdProfiles.push({ ...profile, role: def.role, org: def.org, orgNum: def.orgNum, roleNum: def.roleNum })
    console.log(`  ✓ ${def.email} (${def.role})`)
  }

  // ── Step 3: Org Members ──────────────────────────────────────────────────

  console.log('\nStep 3: Creating org members...')

  const orgMembersData = createdProfiles.map(p => ({
    org_id: p.org_id,
    user_id: p.id,
    role: p.role,
    status: 'active',
  }))

  await mustInsert('org_members', orgMembersData, 'org_members')
  console.log(`  ✓ Created ${orgMembersData.length} org member records`)

  // ── Step 4: Farms ────────────────────────────────────────────────────────

  console.log('\nStep 4: Creating farms...')

  const farmsData = [
    // Org 1 farms
    { org_id: org1.id, farm_id_code: 'FARM-001', name: 'Sunrise Farm Alpha', region: 'Region X', address: 'Sitio Magsaysay, Brgy Cugman, CDO', capacity: 20000, house_count: 2, status: 'active' },
    { org_id: org1.id, farm_id_code: 'FARM-002', name: 'Sunrise Farm Beta', region: 'Region X', address: 'Sitio Bagong Silang, Brgy Tuburan, CDO', capacity: 18000, house_count: 2, status: 'active' },
    { org_id: org1.id, farm_id_code: 'FARM-003', name: 'Sunrise Farm Gamma', region: 'Region X', address: 'Purok 2, Brgy Macabalan, CDO', capacity: 22000, house_count: 2, status: 'active' },
    { org_id: org1.id, farm_id_code: 'FARM-004', name: 'Sunrise Farm Delta', region: 'Region X', address: 'Purok 4, Brgy Lapasan, CDO', capacity: 20000, house_count: 2, status: 'active' },
    // Org 2 farms
    { org_id: org2.id, farm_id_code: 'FARM-001', name: 'Golden Farm Alpha', region: 'Region X', address: 'Purok 1, Brgy Tagoloan, Tagoloan, MisOr', capacity: 15000, house_count: 1, status: 'active' },
    { org_id: org2.id, farm_id_code: 'FARM-002', name: 'Golden Farm Beta', region: 'Region X', address: 'Purok 3, Brgy Poblacion, Tagoloan, MisOr', capacity: 16000, house_count: 2, status: 'active' },
    { org_id: org2.id, farm_id_code: 'FARM-003', name: 'Golden Farm Gamma', region: 'Region X', address: 'Sitio Ilaya, Brgy Casinglot, Naawan, MisOr', capacity: 14000, house_count: 1, status: 'active' },
    { org_id: org2.id, farm_id_code: 'FARM-004', name: 'Golden Farm Delta', region: 'Region X', address: 'Purok 6, Brgy Poblacion, Naawan, MisOr', capacity: 15000, house_count: 2, status: 'active' },
  ]

  const farms = await mustInsert('farms', farmsData, 'farms')
  const [f1a, f1b, f1c, f1d, f2a, f2b, f2c, f2d] = farms
  console.log(`  ✓ Created ${farms.length} farms`)

  // ── Step 5: Farm Assignments ─────────────────────────────────────────────

  console.log('\nStep 5: Creating farm assignments...')

  // Helper: find profile by email pattern
  const p = (email: string) => createdProfiles.find(x => x.email === email)

  const tech1Org1 = p('technician1@org1.flockmate.com')
  const tech2Org1 = p('technician2@org1.flockmate.com')
  const tech1Org2 = p('technician1@org2.flockmate.com')
  const tech2Org2 = p('technician2@org2.flockmate.com')
  const grower1Org1 = p('grower1@org1.flockmate.com')
  const grower2Org1 = p('grower2@org1.flockmate.com')
  const grower3Org1 = p('grower3@org1.flockmate.com')
  const grower4Org1 = p('grower4@org1.flockmate.com')
  const grower1Org2 = p('grower1@org2.flockmate.com')
  const grower2Org2 = p('grower2@org2.flockmate.com')
  const grower3Org2 = p('grower3@org2.flockmate.com')
  const grower4Org2 = p('grower4@org2.flockmate.com')

  const assignmentsData = [
    // Org 1 technician assignments: tech1 → farms A+B, tech2 → farms C+D
    { org_id: org1.id, farm_id: f1a.id, user_id: tech1Org1.id, role: 'technician', status: 'active' },
    { org_id: org1.id, farm_id: f1b.id, user_id: tech1Org1.id, role: 'technician', status: 'active' },
    { org_id: org1.id, farm_id: f1c.id, user_id: tech2Org1.id, role: 'technician', status: 'active' },
    { org_id: org1.id, farm_id: f1d.id, user_id: tech2Org1.id, role: 'technician', status: 'active' },
    // Org 1 grower assignments: 1 grower per farm
    { org_id: org1.id, farm_id: f1a.id, user_id: grower1Org1.id, role: 'grower', status: 'active' },
    { org_id: org1.id, farm_id: f1b.id, user_id: grower2Org1.id, role: 'grower', status: 'active' },
    { org_id: org1.id, farm_id: f1c.id, user_id: grower3Org1.id, role: 'grower', status: 'active' },
    { org_id: org1.id, farm_id: f1d.id, user_id: grower4Org1.id, role: 'grower', status: 'active' },
    // Org 2 technician assignments: tech1 → farms A+B, tech2 → farms C+D
    { org_id: org2.id, farm_id: f2a.id, user_id: tech1Org2.id, role: 'technician', status: 'active' },
    { org_id: org2.id, farm_id: f2b.id, user_id: tech1Org2.id, role: 'technician', status: 'active' },
    { org_id: org2.id, farm_id: f2c.id, user_id: tech2Org2.id, role: 'technician', status: 'active' },
    { org_id: org2.id, farm_id: f2d.id, user_id: tech2Org2.id, role: 'technician', status: 'active' },
    // Org 2 grower assignments: 1 grower per farm
    { org_id: org2.id, farm_id: f2a.id, user_id: grower1Org2.id, role: 'grower', status: 'active' },
    { org_id: org2.id, farm_id: f2b.id, user_id: grower2Org2.id, role: 'grower', status: 'active' },
    { org_id: org2.id, farm_id: f2c.id, user_id: grower3Org2.id, role: 'grower', status: 'active' },
    { org_id: org2.id, farm_id: f2d.id, user_id: grower4Org2.id, role: 'grower', status: 'active' },
  ]

  await mustInsert('farm_assignments', assignmentsData, 'farm_assignments')
  console.log(`  ✓ Created ${assignmentsData.length} farm assignments`)

  // ── Step 6: EPEF Incentive Brackets ─────────────────────────────────────

  console.log('\nStep 6: Creating EPEF incentive brackets...')

  const epefBracketsData = [org1.id, org2.id].flatMap(orgId => [
    { org_id: orgId, min_epef: 0, max_epef: 250, incentive_rate_per_kg: 0, description: 'Below Standard' },
    { org_id: orgId, min_epef: 250, max_epef: 300, incentive_rate_per_kg: 1.50, description: 'Standard' },
    { org_id: orgId, min_epef: 300, max_epef: 350, incentive_rate_per_kg: 2.00, description: 'Good' },
    { org_id: orgId, min_epef: 350, max_epef: 9999, incentive_rate_per_kg: 2.50, description: 'Excellent' },
  ])

  const epefBrackets = await mustInsert('epef_incentive_brackets', epefBracketsData, 'epef_brackets')
  console.log(`  ✓ Created ${epefBrackets.length} EPEF brackets`)

  // ── Step 7: BPI Incentive Brackets ──────────────────────────────────────

  console.log('\nStep 7: Creating BPI incentive brackets...')

  const bpiBracketsData = [org1.id, org2.id].flatMap(orgId => [
    { org_id: orgId, min_bpi: 0, max_bpi: 200, incentive_rate_per_kg: 0, description: 'Below Standard' },
    { org_id: orgId, min_bpi: 200, max_bpi: 260, incentive_rate_per_kg: 1.50, description: 'Standard' },
    { org_id: orgId, min_bpi: 260, max_bpi: 320, incentive_rate_per_kg: 2.00, description: 'Good' },
    { org_id: orgId, min_bpi: 320, max_bpi: 9999, incentive_rate_per_kg: 2.50, description: 'Excellent' },
  ])

  const bpiBrackets = await mustInsert('bpi_incentive_brackets', bpiBracketsData, 'bpi_brackets')
  console.log(`  ✓ Created ${bpiBrackets.length} BPI brackets`)

  // ── Step 8: Market Prices (52 weeks, Region X) ───────────────────────────

  console.log('\nStep 8: Creating market prices (52 weeks)...')

  const now = new Date()
  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  const marketPricesData: any[] = []
  const adminOrg1 = p('admin1@org1.flockmate.com')
  const adminOrg2 = p('admin1@org2.flockmate.com')

  // Base farmgate price for Region X broilers (PHP/kg), with slight weekly variation
  const basePriceOrg1 = 115
  const basePriceOrg2 = 113

  for (let week = 0; week < 52; week++) {
    const priceDate = addDays(yearAgo, week * 7)
    // Seasonal variation: slightly higher in dry season (Feb-May), lower mid-year
    const month = priceDate.getMonth()
    const seasonal = month >= 1 && month <= 4 ? 5 : month >= 5 && month <= 8 ? -3 : 0
    const noise = (Math.random() - 0.5) * 4

    for (const [orgId, adminId, base] of [
      [org1.id, adminOrg1.id, basePriceOrg1],
      [org2.id, adminOrg2.id, basePriceOrg2],
    ] as [string, string, number][]) {
      marketPricesData.push({
        org_id: orgId,
        price_date: dateStr(priceDate),
        region: 'Region X',
        farmgate_price_per_kg: Math.round((base + seasonal + noise) * 100) / 100,
        srp_price: Math.round((base + seasonal + noise + 18) * 100) / 100,
        source: 'DA Regional Field Office X',
        data_source: 'da_bulletin',
        entered_by: adminId,
        last_verified_at: priceDate.toISOString(),
      })
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < marketPricesData.length; i += 50) {
    await mustInsert('market_prices', marketPricesData.slice(i, i + 50), `market_prices batch ${i}`)
  }
  console.log(`  ✓ Created ${marketPricesData.length} market price records`)

  // ── Step 9: Inventory Catalog ────────────────────────────────────────────

  console.log('\nStep 9: Creating inventory catalog...')

  // Get system category IDs
  const { data: sysCategories } = await supabase
    .from('inventory_categories')
    .select('id, name')
    .eq('is_system_default', true)

  if (!sysCategories?.length) {
    console.error('❌ No system inventory categories found. Did you run the schema SQL with seed data?')
    process.exit(1)
  }

  const catFeed = sysCategories.find(c => c.name === 'Feed')!
  const catMedical = sysCategories.find(c => c.name === 'Medical')!
  const catSupp = sysCategories.find(c => c.name === 'Supplements')!

  const inventoryItemsData = [org1.id, org2.id].flatMap((orgId, i) => [
    { org_id: orgId, item_id_code: 'FEED-001', name: 'Broiler Starter Feed (Crumble)', category_id: catFeed.id, unit: 'kg', low_stock_threshold: 500 },
    { org_id: orgId, item_id_code: 'FEED-002', name: 'Broiler Grower Feed (Pellet)', category_id: catFeed.id, unit: 'kg', low_stock_threshold: 500 },
    { org_id: orgId, item_id_code: 'FEED-003', name: 'Broiler Finisher Feed (Pellet)', category_id: catFeed.id, unit: 'kg', low_stock_threshold: 500 },
    { org_id: orgId, item_id_code: 'MED-001', name: 'Newcastle Disease Vaccine (ND)', category_id: catMedical.id, unit: 'dose', low_stock_threshold: 1000 },
    { org_id: orgId, item_id_code: 'MED-002', name: 'IBD/Gumboro Vaccine', category_id: catMedical.id, unit: 'dose', low_stock_threshold: 1000 },
    { org_id: orgId, item_id_code: 'MED-003', name: 'Amoxicillin 50% Powder', category_id: catMedical.id, unit: 'g', low_stock_threshold: 200 },
    { org_id: orgId, item_id_code: 'MED-004', name: 'Tylosin Tartrate Solution', category_id: catMedical.id, unit: 'ml', low_stock_threshold: 500 },
    { org_id: orgId, item_id_code: 'SUP-001', name: 'Vitamin C + Electrolyte Mix', category_id: catSupp.id, unit: 'g', low_stock_threshold: 300 },
    { org_id: orgId, item_id_code: 'SUP-002', name: 'Probiotic Powder', category_id: catSupp.id, unit: 'g', low_stock_threshold: 200 },
  ])

  const inventoryItems = await mustInsert('inventory_items', inventoryItemsData, 'inventory_items')
  console.log(`  ✓ Created ${inventoryItems.length} inventory items`)

  // Initialize stock levels for each farm
  const stockData: any[] = []
  for (const farm of farms) {
    const orgItems = inventoryItems.filter(item => item.org_id === farm.org_id)
    for (const item of orgItems) {
      stockData.push({
        org_id: farm.org_id,
        item_id: item.id,
        farm_id: farm.id,
        current_qty: item.name.includes('Feed') ? 2000 : 500,
      })
    }
  }

  await mustInsert('inventory_stock', stockData, 'inventory_stock')
  console.log(`  ✓ Created ${stockData.length} inventory stock records`)

  // ── Step 10: Sensor Nodes ────────────────────────────────────────────────

  console.log('\nStep 10: Creating sensor nodes...')

  const sensorNodesData: any[] = []
  for (const farm of farms) {
    sensorNodesData.push(
      {
        org_id: farm.org_id,
        farm_id: farm.id,
        node_id_code: `NODE-${farm.farm_id_code}-01`,
        location_tag: 'House 1 - Center',
        device_model: 'SensorTech ST-200',
        status: 'online',
        battery_level: 85,
        last_seen_at: new Date().toISOString(),
        installed_at: dateStr(yearAgo),
      },
      {
        org_id: farm.org_id,
        farm_id: farm.id,
        node_id_code: `NODE-${farm.farm_id_code}-02`,
        location_tag: 'House 2 - Center',
        device_model: 'SensorTech ST-200',
        status: 'online',
        battery_level: 72,
        last_seen_at: new Date().toISOString(),
        installed_at: dateStr(yearAgo),
      }
    )
  }

  const sensorNodes = await mustInsert('sensor_nodes', sensorNodesData, 'sensor_nodes')

  // Add metrics per node
  const sensorMetricsData: any[] = []
  for (const node of sensorNodes) {
    sensorMetricsData.push(
      { node_id: node.id, metric_type: 'temperature', unit: '°C', is_active: true },
      { node_id: node.id, metric_type: 'humidity', unit: '%', is_active: true },
      { node_id: node.id, metric_type: 'ammonia', unit: 'ppm', is_active: true },
    )
  }

  await mustInsert('sensor_node_metrics', sensorMetricsData, 'sensor_node_metrics')
  console.log(`  ✓ Created ${sensorNodes.length} sensor nodes with ${sensorMetricsData.length} metrics`)

  // ── Step 11: Alert Thresholds ────────────────────────────────────────────

  console.log('\nStep 11: Creating alert thresholds...')

  const admin1Org1 = p('admin1@org1.flockmate.com')
  const admin1Org2 = p('admin1@org2.flockmate.com')

  const alertThresholdsData = [
    // Org 1 org-wide thresholds
    { org_id: org1.id, scope_type: 'org', metric_type: 'temperature', min_value: 18, max_value: 35, is_active: true, created_by: admin1Org1.id },
    { org_id: org1.id, scope_type: 'org', metric_type: 'humidity', min_value: 50, max_value: 80, is_active: true, created_by: admin1Org1.id },
    { org_id: org1.id, scope_type: 'org', metric_type: 'ammonia', min_value: 0, max_value: 20, is_active: true, created_by: admin1Org1.id },
    // Org 2 org-wide thresholds
    { org_id: org2.id, scope_type: 'org', metric_type: 'temperature', min_value: 18, max_value: 35, is_active: true, created_by: admin1Org2.id },
    { org_id: org2.id, scope_type: 'org', metric_type: 'humidity', min_value: 50, max_value: 80, is_active: true, created_by: admin1Org2.id },
    { org_id: org2.id, scope_type: 'org', metric_type: 'ammonia', min_value: 0, max_value: 20, is_active: true, created_by: admin1Org2.id },
  ]

  await mustInsert('alert_thresholds', alertThresholdsData, 'alert_thresholds')
  console.log(`  ✓ Created ${alertThresholdsData.length} alert thresholds`)

  // ── Done ─────────────────────────────────────────────────────────────────

  console.log('\n─────────────────────────────────────────────')
  console.log('✓ seed-schema complete')
  console.log('\nOrg 1 (Sunrise Poultry Integrators):')
  console.log(`  ID: ${org1.id}`)
  console.log(`  Accounts: admin1@org1.flockmate.com ... grower4@org1.flockmate.com`)
  console.log('\nOrg 2 (Golden Harvest Farms):')
  console.log(`  ID: ${org2.id}`)
  console.log(`  Accounts: admin1@org2.flockmate.com ... grower4@org2.flockmate.com`)
  console.log('\nAll account passwords: password123')
  console.log('─────────────────────────────────────────────')
}

main().catch(err => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
