export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alert_thresholds: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          farm_id: string | null
          id: string
          is_active: boolean
          max_value: number | null
          metric_type: string
          min_value: number | null
          org_id: string
          scope_type: string
          sensor_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          farm_id?: string | null
          id?: string
          is_active?: boolean
          max_value?: number | null
          metric_type: string
          min_value?: number | null
          org_id: string
          scope_type: string
          sensor_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          farm_id?: string | null
          id?: string
          is_active?: boolean
          max_value?: number | null
          metric_type?: string
          min_value?: number | null
          org_id?: string
          scope_type?: string
          sensor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_thresholds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_thresholds_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_thresholds_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_thresholds_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      bpi_incentive_brackets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incentive_rate_per_head: number | null
          incentive_rate_per_kg: number | null
          max_bpi: number
          min_bpi: number
          org_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incentive_rate_per_head?: number | null
          incentive_rate_per_kg?: number | null
          max_bpi: number
          min_bpi: number
          org_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incentive_rate_per_head?: number | null
          incentive_rate_per_kg?: number | null
          max_bpi?: number
          min_bpi?: number
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bpi_incentive_brackets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_advance_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          cycle_id: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          org_id: string
          reason: string | null
          request_date: string
          requester_type: string
          status: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          cycle_id?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          org_id: string
          reason?: string | null
          request_date?: string
          requester_type: string
          status?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          cycle_id?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          org_id?: string
          reason?: string | null
          request_date?: string
          requester_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_advance_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_advance_requests_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_advance_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_advance_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_expenses: {
        Row: {
          amount_excl_vat: number
          approved_at: string | null
          approved_by: string | null
          category_id: string
          created_at: string
          cycle_id: string | null
          deleted_at: string | null
          description: string
          ewt_amount: number
          ewt_rate: number
          farm_id: string
          id: string
          notes: string | null
          org_id: string
          receipt_no: string | null
          status: string
          submitted_by: string
          total_paid: number
          vat_amount: number
        }
        Insert: {
          amount_excl_vat: number
          approved_at?: string | null
          approved_by?: string | null
          category_id: string
          created_at?: string
          cycle_id?: string | null
          deleted_at?: string | null
          description: string
          ewt_amount?: number
          ewt_rate?: number
          farm_id: string
          id?: string
          notes?: string | null
          org_id: string
          receipt_no?: string | null
          status?: string
          submitted_by: string
          total_paid: number
          vat_amount?: number
        }
        Update: {
          amount_excl_vat?: number
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string
          created_at?: string
          cycle_id?: string | null
          deleted_at?: string | null
          description?: string
          ewt_amount?: number
          ewt_rate?: number
          farm_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          receipt_no?: string | null
          status?: string
          submitted_by?: string
          total_paid?: number
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "cycle_expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_expenses_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_expenses_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_expenses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_expenses_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          avg_ammonia_ppm: number | null
          avg_co2_ppm: number | null
          avg_humidity_pct: number | null
          avg_temp_c: number | null
          avg_weight_g: number | null
          created_at: string
          culled_count: number
          cycle_id: string
          deleted_at: string | null
          entry_type: string
          feed_used_kg: number
          id: string
          log_date: string
          mortality_count: number
          notes: string | null
          org_id: string
          quarantined_count: number
          status: string
          submitted_by: string
          water_temp_celsius: number | null
          water_used_liters: number | null
        }
        Insert: {
          avg_ammonia_ppm?: number | null
          avg_co2_ppm?: number | null
          avg_humidity_pct?: number | null
          avg_temp_c?: number | null
          avg_weight_g?: number | null
          created_at?: string
          culled_count?: number
          cycle_id: string
          deleted_at?: string | null
          entry_type: string
          feed_used_kg?: number
          id?: string
          log_date: string
          mortality_count?: number
          notes?: string | null
          org_id: string
          quarantined_count?: number
          status?: string
          submitted_by: string
          water_temp_celsius?: number | null
          water_used_liters?: number | null
        }
        Update: {
          avg_ammonia_ppm?: number | null
          avg_co2_ppm?: number | null
          avg_humidity_pct?: number | null
          avg_temp_c?: number | null
          avg_weight_g?: number | null
          created_at?: string
          culled_count?: number
          cycle_id?: string
          deleted_at?: string | null
          entry_type?: string
          feed_used_kg?: number
          id?: string
          log_date?: string
          mortality_count?: number
          notes?: string | null
          org_id?: string
          quarantined_count?: number
          status?: string
          submitted_by?: string
          water_temp_celsius?: number | null
          water_used_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivered_inputs: {
        Row: {
          cost_per_unit: number
          created_at: string
          cycle_id: string
          deleted_at: string | null
          delivery_date: string
          farm_id: string
          id: string
          item_name: string
          item_type: string
          notes: string | null
          org_id: string
          quantity_delivered: number
          received_by: string | null
          total_cost: number | null
          unit: string
        }
        Insert: {
          cost_per_unit: number
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          delivery_date: string
          farm_id: string
          id?: string
          item_name: string
          item_type: string
          notes?: string | null
          org_id: string
          quantity_delivered: number
          received_by?: string | null
          total_cost?: number | null
          unit: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          delivery_date?: string
          farm_id?: string
          id?: string
          item_name?: string
          item_type?: string
          notes?: string | null
          org_id?: string
          quantity_delivered?: number
          received_by?: string | null
          total_cost?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivered_inputs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivered_inputs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivered_inputs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivered_inputs_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_loading: {
        Row: {
          actual_placed_quantity: number
          arrival_time: string | null
          average_chick_weight_g: number | null
          beak_condition: string | null
          chick_uniformity_score: number | null
          created_at: string
          cycle_id: string
          dead_on_arrival_count: number
          delivered_quantity: number
          hatchery_name: string | null
          hydration_status: string | null
          id: string
          org_id: string
          recorded_by: string | null
          source_farm_cert_no: string
          transport_truck_temp_c: number | null
        }
        Insert: {
          actual_placed_quantity: number
          arrival_time?: string | null
          average_chick_weight_g?: number | null
          beak_condition?: string | null
          chick_uniformity_score?: number | null
          created_at?: string
          cycle_id: string
          dead_on_arrival_count?: number
          delivered_quantity: number
          hatchery_name?: string | null
          hydration_status?: string | null
          id?: string
          org_id: string
          recorded_by?: string | null
          source_farm_cert_no: string
          transport_truck_temp_c?: number | null
        }
        Update: {
          actual_placed_quantity?: number
          arrival_time?: string | null
          average_chick_weight_g?: number | null
          beak_condition?: string | null
          chick_uniformity_score?: number | null
          created_at?: string
          cycle_id?: string
          dead_on_arrival_count?: number
          delivered_quantity?: number
          hatchery_name?: string | null
          hydration_status?: string | null
          id?: string
          org_id?: string
          recorded_by?: string | null
          source_farm_cert_no?: string
          transport_truck_temp_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doc_loading_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: true
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_loading_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_loading_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      downtime_checklist: {
        Row: {
          activity: string
          completion_date: string | null
          created_at: string
          farm_id: string
          id: string
          inspected_by: string | null
          notes: string | null
          org_id: string
          prev_cycle_id: string | null
          status: string
        }
        Insert: {
          activity: string
          completion_date?: string | null
          created_at?: string
          farm_id: string
          id?: string
          inspected_by?: string | null
          notes?: string | null
          org_id: string
          prev_cycle_id?: string | null
          status?: string
        }
        Update: {
          activity?: string
          completion_date?: string | null
          created_at?: string
          farm_id?: string
          id?: string
          inspected_by?: string | null
          notes?: string | null
          org_id?: string
          prev_cycle_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "downtime_checklist_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downtime_checklist_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downtime_checklist_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downtime_checklist_prev_cycle_id_fkey"
            columns: ["prev_cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      epef_incentive_brackets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incentive_rate_per_head: number | null
          incentive_rate_per_kg: number | null
          max_epef: number
          min_epef: number
          org_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incentive_rate_per_head?: number | null
          incentive_rate_per_kg?: number | null
          max_epef: number
          min_epef: number
          org_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incentive_rate_per_head?: number | null
          incentive_rate_per_kg?: number | null
          max_epef?: number
          min_epef?: number
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epef_incentive_brackets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_system_default: boolean
          name: string
          org_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_system_default?: boolean
          name: string
          org_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_system_default?: boolean
          name?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_assignments: {
        Row: {
          created_at: string
          date_assigned: string
          deleted_at: string | null
          farm_id: string
          id: string
          org_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_assigned?: string
          deleted_at?: string | null
          farm_id: string
          id?: string
          org_id: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_assigned?: string
          deleted_at?: string | null
          farm_id?: string
          id?: string
          org_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_assignments_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string
          farm_id: string
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          org_id: string
          reason: string | null
        }
        Insert: {
          changed_at?: string
          changed_by: string
          farm_id: string
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          org_id: string
          reason?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string
          farm_id?: string
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          org_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_audit_logs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          address: string | null
          capacity: number
          created_at: string
          deleted_at: string | null
          farm_id_code: string
          house_count: number
          id: string
          image_url: string | null
          location_lat: number | null
          location_lng: number | null
          name: string
          org_id: string
          owner_id: string | null
          region: string | null
          status: string
        }
        Insert: {
          address?: string | null
          capacity: number
          created_at?: string
          deleted_at?: string | null
          farm_id_code: string
          house_count?: number
          id?: string
          image_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          org_id: string
          owner_id?: string | null
          region?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          capacity?: number
          created_at?: string
          deleted_at?: string | null
          farm_id_code?: string
          house_count?: number
          id?: string
          image_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          org_id?: string
          owner_id?: string | null
          region?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_ledger: {
        Row: {
          advance_id: string | null
          amount: number
          created_at: string
          created_by: string
          description: string
          expense_id: string | null
          id: string
          org_id: string
          payment_id: string | null
          payroll_id: string | null
          sale_id: string | null
          settlement_id: string | null
          status: string
          transaction_type: string
        }
        Insert: {
          advance_id?: string | null
          amount: number
          created_at?: string
          created_by: string
          description: string
          expense_id?: string | null
          id?: string
          org_id: string
          payment_id?: string | null
          payroll_id?: string | null
          sale_id?: string | null
          settlement_id?: string | null
          status: string
          transaction_type: string
        }
        Update: {
          advance_id?: string | null
          amount?: number
          created_at?: string
          created_by?: string
          description?: string
          expense_id?: string | null
          id?: string
          org_id?: string
          payment_id?: string | null
          payroll_id?: string | null
          sale_id?: string | null
          settlement_id?: string | null
          status?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_ledger_advance_id_fkey"
            columns: ["advance_id"]
            isOneToOne: false
            referencedRelation: "cash_advance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "cycle_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "sale_payment_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_payroll_id_fkey"
            columns: ["payroll_id"]
            isOneToOne: false
            referencedRelation: "payroll_payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "harvest_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      grower_performance: {
        Row: {
          average_harvest_weight_kg: number | null
          base_points: number | null
          bpi_bracket_id: string | null
          bpi_score: number | null
          consistency_bonus_points: number | null
          created_at: string
          cycle_completion_points: number | null
          cycle_id: string
          days_in_house: number | null
          epef_bracket_id: string | null
          epef_score: number | null
          excess_feed_kg: number | null
          fcr_bonus_points: number | null
          final_fcr: number | null
          final_mortality_rate: number | null
          grower_id: string
          id: string
          mortality_bonus_points: number | null
          org_id: string
          performance_year: number
          total_birds_harvested: number | null
          total_birds_placed: number | null
          total_feed_consumed_kg: number | null
          total_feed_delivered_kg: number | null
          total_points: number | null
        }
        Insert: {
          average_harvest_weight_kg?: number | null
          base_points?: number | null
          bpi_bracket_id?: string | null
          bpi_score?: number | null
          consistency_bonus_points?: number | null
          created_at?: string
          cycle_completion_points?: number | null
          cycle_id: string
          days_in_house?: number | null
          epef_bracket_id?: string | null
          epef_score?: number | null
          excess_feed_kg?: number | null
          fcr_bonus_points?: number | null
          final_fcr?: number | null
          final_mortality_rate?: number | null
          grower_id: string
          id?: string
          mortality_bonus_points?: number | null
          org_id: string
          performance_year: number
          total_birds_harvested?: number | null
          total_birds_placed?: number | null
          total_feed_consumed_kg?: number | null
          total_feed_delivered_kg?: number | null
          total_points?: number | null
        }
        Update: {
          average_harvest_weight_kg?: number | null
          base_points?: number | null
          bpi_bracket_id?: string | null
          bpi_score?: number | null
          consistency_bonus_points?: number | null
          created_at?: string
          cycle_completion_points?: number | null
          cycle_id?: string
          days_in_house?: number | null
          epef_bracket_id?: string | null
          epef_score?: number | null
          excess_feed_kg?: number | null
          fcr_bonus_points?: number | null
          final_fcr?: number | null
          final_mortality_rate?: number | null
          grower_id?: string
          id?: string
          mortality_bonus_points?: number | null
          org_id?: string
          performance_year?: number
          total_birds_harvested?: number | null
          total_birds_placed?: number | null
          total_feed_consumed_kg?: number | null
          total_feed_delivered_kg?: number | null
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grower_performance_bpi_bracket_id_fkey"
            columns: ["bpi_bracket_id"]
            isOneToOne: false
            referencedRelation: "bpi_incentive_brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grower_performance_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: true
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grower_performance_epef_bracket_id_fkey"
            columns: ["epef_bracket_id"]
            isOneToOne: false
            referencedRelation: "epef_incentive_brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grower_performance_grower_id_fkey"
            columns: ["grower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grower_performance_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_logs: {
        Row: {
          birds_harvested_count: number
          birds_rejected_count: number
          buyer_representative_name: string | null
          created_at: string
          cycle_id: string
          deleted_at: string | null
          disposal_method: string | null
          fleet_used: string | null
          gross_weight_kg: number
          harvest_date_completion: string | null
          harvest_date_start: string
          harvest_team_notes: string | null
          id: string
          is_validated: boolean
          loading_loss_count: number
          net_sold_weight_kg: number | null
          nmis_cert_no: string | null
          nmis_compliant: boolean
          org_id: string
          reject_weight_kg: number
          technician_in_charge_id: string | null
          truck_plate_numbers: string[] | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          birds_harvested_count: number
          birds_rejected_count?: number
          buyer_representative_name?: string | null
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          disposal_method?: string | null
          fleet_used?: string | null
          gross_weight_kg: number
          harvest_date_completion?: string | null
          harvest_date_start: string
          harvest_team_notes?: string | null
          id?: string
          is_validated?: boolean
          loading_loss_count?: number
          net_sold_weight_kg?: number | null
          nmis_cert_no?: string | null
          nmis_compliant?: boolean
          org_id: string
          reject_weight_kg?: number
          technician_in_charge_id?: string | null
          truck_plate_numbers?: string[] | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          birds_harvested_count?: number
          birds_rejected_count?: number
          buyer_representative_name?: string | null
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          disposal_method?: string | null
          fleet_used?: string | null
          gross_weight_kg?: number
          harvest_date_completion?: string | null
          harvest_date_start?: string
          harvest_team_notes?: string | null
          id?: string
          is_validated?: boolean
          loading_loss_count?: number
          net_sold_weight_kg?: number | null
          nmis_cert_no?: string | null
          nmis_compliant?: boolean
          org_id?: string
          reject_weight_kg?: number
          technician_in_charge_id?: string | null
          truck_plate_numbers?: string[] | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harvest_logs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: true
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_logs_technician_in_charge_id_fkey"
            columns: ["technician_in_charge_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_logs_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_performance: {
        Row: {
          avg_daily_gain_g: number | null
          bpi_bracket_id: string | null
          bpi_score: number | null
          created_at: string
          cycle_id: string
          days_in_house: number
          epef_bracket_id: string | null
          epef_score: number | null
          excess_feed_kg: number | null
          final_avg_weight_g: number | null
          final_fcr: number | null
          final_livability_pct: number | null
          id: string
          org_id: string
          total_culls_count: number | null
          total_feed_consumed_kg: number | null
          total_feed_delivered_kg: number | null
          total_mortality_count: number | null
        }
        Insert: {
          avg_daily_gain_g?: number | null
          bpi_bracket_id?: string | null
          bpi_score?: number | null
          created_at?: string
          cycle_id: string
          days_in_house: number
          epef_bracket_id?: string | null
          epef_score?: number | null
          excess_feed_kg?: number | null
          final_avg_weight_g?: number | null
          final_fcr?: number | null
          final_livability_pct?: number | null
          id?: string
          org_id: string
          total_culls_count?: number | null
          total_feed_consumed_kg?: number | null
          total_feed_delivered_kg?: number | null
          total_mortality_count?: number | null
        }
        Update: {
          avg_daily_gain_g?: number | null
          bpi_bracket_id?: string | null
          bpi_score?: number | null
          created_at?: string
          cycle_id?: string
          days_in_house?: number
          epef_bracket_id?: string | null
          epef_score?: number | null
          excess_feed_kg?: number | null
          final_avg_weight_g?: number | null
          final_fcr?: number | null
          final_livability_pct?: number | null
          id?: string
          org_id?: string
          total_culls_count?: number | null
          total_feed_consumed_kg?: number | null
          total_feed_delivered_kg?: number | null
          total_mortality_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_hp_bpi_bracket"
            columns: ["bpi_bracket_id"]
            isOneToOne: false
            referencedRelation: "bpi_incentive_brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_hp_epef_bracket"
            columns: ["epef_bracket_id"]
            isOneToOne: false
            referencedRelation: "epef_incentive_brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_performance_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: true
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_performance_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_sales: {
        Row: {
          actual_payment_date: string | null
          buyer_name: string
          channel: string
          created_at: string
          cycle_id: string
          deleted_at: string | null
          expected_payment_date: string | null
          gross_revenue: number
          harvest_id: string
          id: string
          net_revenue: number
          notes: string | null
          org_id: string
          payment_status: string
          price_per_kg_actual: number
          reject_deductions: number
          total_head_count: number
          total_weight_kg: number
        }
        Insert: {
          actual_payment_date?: string | null
          buyer_name: string
          channel: string
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          expected_payment_date?: string | null
          gross_revenue: number
          harvest_id: string
          id?: string
          net_revenue: number
          notes?: string | null
          org_id: string
          payment_status?: string
          price_per_kg_actual: number
          reject_deductions?: number
          total_head_count: number
          total_weight_kg: number
        }
        Update: {
          actual_payment_date?: string | null
          buyer_name?: string
          channel?: string
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          expected_payment_date?: string | null
          gross_revenue?: number
          harvest_id?: string
          id?: string
          net_revenue?: number
          notes?: string | null
          org_id?: string
          payment_status?: string
          price_per_kg_actual?: number
          reject_deductions?: number
          total_head_count?: number
          total_weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "harvest_sales_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_sales_harvest_id_fkey"
            columns: ["harvest_id"]
            isOneToOne: false
            referencedRelation: "harvest_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_sales_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          cycle_id: string
          deleted_at: string | null
          gahp_standard_ref: string | null
          id: string
          is_gahp_compliant: boolean
          notes: string | null
          org_id: string
          photos: string[] | null
          record_date: string
          record_type: string
          subject: string
          submitted_by: string
          veterinarian_id: string | null
        }
        Insert: {
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          gahp_standard_ref?: string | null
          id?: string
          is_gahp_compliant?: boolean
          notes?: string | null
          org_id: string
          photos?: string[] | null
          record_date: string
          record_type: string
          subject: string
          submitted_by: string
          veterinarian_id?: string | null
        }
        Update: {
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          gahp_standard_ref?: string | null
          id?: string
          is_gahp_compliant?: boolean
          notes?: string | null
          org_id?: string
          photos?: string[] | null
          record_date?: string
          record_type?: string
          subject?: string
          submitted_by?: string
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_system_default: boolean
          name: string
          org_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_system_default?: boolean
          name: string
          org_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_system_default?: boolean
          name?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category_id: string
          created_at: string
          deleted_at: string | null
          id: string
          item_id_code: string
          low_stock_threshold: number | null
          name: string
          org_id: string
          unit: string
        }
        Insert: {
          category_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          item_id_code: string
          low_stock_threshold?: number | null
          name: string
          org_id: string
          unit: string
        }
        Update: {
          category_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          item_id_code?: string
          low_stock_threshold?: number | null
          name?: string
          org_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          order_id: string
          price: number | null
          qty: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          order_id: string
          price?: number | null
          qty: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          order_id?: string
          price?: number | null
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "inventory_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_orders: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          expected_delivery: string | null
          farm_id: string
          id: string
          notes: string | null
          org_id: string
          status: string
          supplier_id: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          expected_delivery?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          org_id: string
          status?: string
          supplier_id?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          expected_delivery?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          status?: string
          supplier_id?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_orders_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          current_qty: number
          farm_id: string
          id: string
          item_id: string
          last_updated: string
          org_id: string
        }
        Insert: {
          current_qty?: number
          farm_id: string
          id?: string
          item_id: string
          last_updated?: string
          org_id: string
        }
        Update: {
          current_qty?: number
          farm_id?: string
          id?: string
          item_id?: string
          last_updated?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock_ledger: {
        Row: {
          change_qty: number
          changed_at: string
          changed_by: string
          farm_id: string
          id: string
          item_id: string
          org_id: string
          reason: string
          reference_id: string | null
        }
        Insert: {
          change_qty: number
          changed_at?: string
          changed_by: string
          farm_id: string
          id?: string
          item_id: string
          org_id: string
          reason: string
          reference_id?: string | null
        }
        Update: {
          change_qty?: number
          changed_at?: string
          changed_by?: string
          farm_id?: string
          id?: string
          item_id?: string
          org_id?: string
          reason?: string
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_ledger_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_ledger_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_ledger_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          created_at: string
          data_source: string
          entered_by: string
          farmgate_price_per_kg: number
          id: string
          last_verified_at: string | null
          org_id: string
          price_date: string
          region: string
          source: string | null
          srp_price: number | null
        }
        Insert: {
          created_at?: string
          data_source?: string
          entered_by: string
          farmgate_price_per_kg: number
          id?: string
          last_verified_at?: string | null
          org_id: string
          price_date: string
          region: string
          source?: string | null
          srp_price?: number | null
        }
        Update: {
          created_at?: string
          data_source?: string
          entered_by?: string
          farmgate_price_per_kg?: number
          id?: string
          last_verified_at?: string | null
          org_id?: string
          price_date?: string
          region?: string
          source?: string | null
          srp_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_prices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          administered_by: string | null
          created_at: string
          cycle_id: string
          daily_log_id: string
          dosage: number
          id: string
          medication_name: string
          org_id: string
          purpose: string | null
          unit: string
          withdrawal_period_days: number
        }
        Insert: {
          administered_by?: string | null
          created_at?: string
          cycle_id: string
          daily_log_id: string
          dosage: number
          id?: string
          medication_name: string
          org_id: string
          purpose?: string | null
          unit: string
          withdrawal_period_days?: number
        }
        Update: {
          administered_by?: string | null
          created_at?: string
          cycle_id?: string
          daily_log_id?: string
          dosage?: number
          id?: string
          medication_name?: string
          org_id?: string
          purpose?: string | null
          unit?: string
          withdrawal_period_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          org_id: string
          read_status: boolean
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          org_id: string
          read_status?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          org_id?: string
          read_status?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          org_id: string
          role: string
          status?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          org_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          org_id: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          org_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          currency: string
          default_fcr_target: number
          default_harvest_age_days: number
          heat_stress_critical_temp_c: number
          heat_stress_warning_temp_c: number
          low_stock_alert_days: number
          org_id: string
          payment_terms_days: number
          performance_metric_display: string
          timezone: string
          updated_at: string
        }
        Insert: {
          currency?: string
          default_fcr_target?: number
          default_harvest_age_days?: number
          heat_stress_critical_temp_c?: number
          heat_stress_warning_temp_c?: number
          low_stock_alert_days?: number
          org_id: string
          payment_terms_days?: number
          performance_metric_display?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          currency?: string
          default_fcr_target?: number
          default_harvest_age_days?: number
          heat_stress_critical_temp_c?: number
          heat_stress_warning_temp_c?: number
          low_stock_alert_days?: number
          org_id?: string
          payment_terms_days?: number
          performance_metric_display?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          billing_email: string | null
          billing_status: string
          contact_number: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          plan: string
          region: string | null
          slug: string
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          billing_status?: string
          contact_number?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          plan?: string
          region?: string | null
          slug: string
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          billing_status?: string
          contact_number?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          plan?: string
          region?: string | null
          slug?: string
        }
        Relationships: []
      }
      payroll_deductions_breakdown: {
        Row: {
          amount: number
          created_at: string
          deduction_type: string
          employer_share: number
          id: string
          is_statutory: boolean
          org_id: string
          payout_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deduction_type: string
          employer_share?: number
          id?: string
          is_statutory?: boolean
          org_id: string
          payout_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deduction_type?: string
          employer_share?: number
          id?: string
          is_statutory?: boolean
          org_id?: string
          payout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_deductions_breakdown_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_deductions_breakdown_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payroll_payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_payouts: {
        Row: {
          base_pay: number
          created_at: string
          deleted_at: string | null
          id: string
          monthly_allowance: number
          net_payout: number
          org_id: string
          other_bonuses: number
          paid_at: string | null
          pay_period_end: string
          pay_period_start: string
          payment_status: string
          total_deductions: number
          total_gross_payout: number
          user_id: string
        }
        Insert: {
          base_pay: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          monthly_allowance?: number
          net_payout: number
          org_id: string
          other_bonuses?: number
          paid_at?: string | null
          pay_period_end: string
          pay_period_start: string
          payment_status?: string
          total_deductions?: number
          total_gross_payout: number
          user_id: string
        }
        Update: {
          base_pay?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          monthly_allowance?: number
          net_payout?: number
          org_id?: string
          other_bonuses?: number
          paid_at?: string | null
          pay_period_end?: string
          pay_period_start?: string
          payment_status?: string
          total_deductions?: number
          total_gross_payout?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_payouts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_payouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          avg_daily_gain_g: number | null
          created_at: string
          cycle_id: string
          daily_log_id: string
          fcr_to_date: number | null
          id: string
          livability_pct: number | null
          org_id: string
          uniformity_pct: number | null
          water_to_feed_ratio: number | null
        }
        Insert: {
          avg_daily_gain_g?: number | null
          created_at?: string
          cycle_id: string
          daily_log_id: string
          fcr_to_date?: number | null
          id?: string
          livability_pct?: number | null
          org_id: string
          uniformity_pct?: number | null
          water_to_feed_ratio?: number | null
        }
        Update: {
          avg_daily_gain_g?: number | null
          created_at?: string
          cycle_id?: string
          daily_log_id?: string
          fcr_to_date?: number | null
          id?: string
          livability_pct?: number | null
          org_id?: string
          uniformity_pct?: number | null
          water_to_feed_ratio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_metrics_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: true
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      production_cycles: {
        Row: {
          actual_end_date: string | null
          anticipated_harvest_date: string | null
          batch_name: string
          batch_number: string | null
          breed: string | null
          created_at: string
          deleted_at: string | null
          farm_id: string
          finisher_feed_projected_kg: number | null
          flag_reason: string | null
          grower_feed_projected_kg: number | null
          grower_id: string
          id: string
          initial_birds: number
          is_flagged: boolean
          org_id: string
          start_date: string
          starter_feed_projected_kg: number | null
          status: string
          target_weight_kg: number | null
          vaccination_template_id: string | null
        }
        Insert: {
          actual_end_date?: string | null
          anticipated_harvest_date?: string | null
          batch_name: string
          batch_number?: string | null
          breed?: string | null
          created_at?: string
          deleted_at?: string | null
          farm_id: string
          finisher_feed_projected_kg?: number | null
          flag_reason?: string | null
          grower_feed_projected_kg?: number | null
          grower_id: string
          id?: string
          initial_birds: number
          is_flagged?: boolean
          org_id: string
          start_date: string
          starter_feed_projected_kg?: number | null
          status?: string
          target_weight_kg?: number | null
          vaccination_template_id?: string | null
        }
        Update: {
          actual_end_date?: string | null
          anticipated_harvest_date?: string | null
          batch_name?: string
          batch_number?: string | null
          breed?: string | null
          created_at?: string
          deleted_at?: string | null
          farm_id?: string
          finisher_feed_projected_kg?: number | null
          flag_reason?: string | null
          grower_feed_projected_kg?: number | null
          grower_id?: string
          id?: string
          initial_birds?: number
          is_flagged?: boolean
          org_id?: string
          start_date?: string
          starter_feed_projected_kg?: number | null
          status?: string
          target_weight_kg?: number | null
          vaccination_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pc_vax_template"
            columns: ["vaccination_template_id"]
            isOneToOne: false
            referencedRelation: "vaccination_schedule_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_cycles_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_cycles_grower_id_fkey"
            columns: ["grower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_cycles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          base_pay: number | null
          contact_number: string | null
          created_at: string
          deleted_at: string | null
          email: string
          employment_type: string | null
          first_name: string
          force_password_change: boolean
          hdmf_no: string | null
          id: string
          last_name: string
          monthly_allowance: number | null
          org_id: string | null
          philhealth_no: string | null
          role: string
          sss_no: string | null
          staff_id_code: string | null
          status: string
          statutory_deductions_enabled: boolean
          tin_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          base_pay?: number | null
          contact_number?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          employment_type?: string | null
          first_name: string
          force_password_change?: boolean
          hdmf_no?: string | null
          id: string
          last_name: string
          monthly_allowance?: number | null
          org_id?: string | null
          philhealth_no?: string | null
          role: string
          sss_no?: string | null
          staff_id_code?: string | null
          status?: string
          statutory_deductions_enabled?: boolean
          tin_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          base_pay?: number | null
          contact_number?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          employment_type?: string | null
          first_name?: string
          force_password_change?: boolean
          hdmf_no?: string | null
          id?: string
          last_name?: string
          monthly_allowance?: number | null
          org_id?: string | null
          philhealth_no?: string | null
          role?: string
          sss_no?: string | null
          staff_id_code?: string | null
          status?: string
          statutory_deductions_enabled?: boolean
          tin_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_payment_schedules: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          deleted_at: string | null
          due_date: string
          id: string
          notes: string | null
          org_id: string
          payment_date: string | null
          sale_id: string
          status: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number
          created_at?: string
          deleted_at?: string | null
          due_date: string
          id?: string
          notes?: string | null
          org_id: string
          payment_date?: string | null
          sale_id: string
          status?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          deleted_at?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          org_id?: string
          payment_date?: string | null
          sale_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_payment_schedules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payment_schedules_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "harvest_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_value: number | null
          created_at: string
          farm_id: string
          id: string
          message: string
          metric_id: string | null
          node_id: string
          org_id: string
          resolved_at: string | null
          status: string
          threshold_id: string | null
          trigger_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_value?: number | null
          created_at?: string
          farm_id: string
          id?: string
          message: string
          metric_id?: string | null
          node_id: string
          org_id: string
          resolved_at?: string | null
          status?: string
          threshold_id?: string | null
          trigger_type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_value?: number | null
          created_at?: string
          farm_id?: string
          id?: string
          message?: string
          metric_id?: string | null
          node_id?: string
          org_id?: string
          resolved_at?: string | null
          status?: string
          threshold_id?: string | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_alerts_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "sensor_node_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_alerts_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_alerts_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "alert_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_node_metrics: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          metric_type: string
          node_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          metric_type: string
          node_id: string
          unit: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          metric_type?: string
          node_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_node_metrics_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_nodes: {
        Row: {
          battery_level: number | null
          created_at: string
          deleted_at: string | null
          device_model: string | null
          farm_id: string
          id: string
          installed_at: string | null
          last_seen_at: string | null
          location_tag: string | null
          node_id_code: string
          org_id: string
          status: string
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          deleted_at?: string | null
          device_model?: string | null
          farm_id: string
          id?: string
          installed_at?: string | null
          last_seen_at?: string | null
          location_tag?: string | null
          node_id_code: string
          org_id: string
          status?: string
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          deleted_at?: string | null
          device_model?: string | null
          farm_id?: string
          id?: string
          installed_at?: string | null
          last_seen_at?: string | null
          location_tag?: string | null
          node_id_code?: string
          org_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_nodes_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_nodes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          is_anomaly: boolean
          metric_id: string
          node_id: string
          org_id: string
          recorded_at: string
          value: number
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          is_anomaly?: boolean
          metric_id: string
          node_id: string
          org_id: string
          recorded_at: string
          value: number
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          is_anomaly?: boolean
          metric_id?: string
          node_id?: string
          org_id?: string
          recorded_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "sensor_node_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_deductions: {
        Row: {
          amount: number
          category: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          is_auto_computed: boolean
          org_id: string
          reference_id: string | null
          statement_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          is_auto_computed?: boolean
          org_id: string
          reference_id?: string | null
          statement_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_auto_computed?: boolean
          org_id?: string
          reference_id?: string | null
          statement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_deductions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_deductions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "settlement_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_statements: {
        Row: {
          bir_form_type: string | null
          created_at: string
          cumulative_annual_payment: number | null
          cycle_id: string
          ewt_amount: number
          ewt_rate: number
          farm_id: string
          final_net_payout: number | null
          grower_fee_rate_per_kg: number | null
          grower_fee_total: number | null
          grower_id: string
          id: string
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          org_id: string
          sale_price_per_kg: number | null
          status: string
          total_deductions: number
          total_live_weight_kg: number | null
          total_production_value: number | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bir_form_type?: string | null
          created_at?: string
          cumulative_annual_payment?: number | null
          cycle_id: string
          ewt_amount?: number
          ewt_rate?: number
          farm_id: string
          final_net_payout?: number | null
          grower_fee_rate_per_kg?: number | null
          grower_fee_total?: number | null
          grower_id: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          org_id: string
          sale_price_per_kg?: number | null
          status?: string
          total_deductions?: number
          total_live_weight_kg?: number | null
          total_production_value?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bir_form_type?: string | null
          created_at?: string
          cumulative_annual_payment?: number | null
          cycle_id?: string
          ewt_amount?: number
          ewt_rate?: number
          farm_id?: string
          final_net_payout?: number | null
          grower_fee_rate_per_kg?: number | null
          grower_fee_total?: number | null
          grower_id?: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          org_id?: string
          sale_price_per_kg?: number | null
          status?: string
          total_deductions?: number
          total_live_weight_kg?: number | null
          total_production_value?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlement_statements_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: true
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_statements_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_statements_grower_id_fkey"
            columns: ["grower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_statements_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_statements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_statements_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_number: string | null
          contact_person: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          org_id: string
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          org_id: string
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_schedule_templates: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_system_default: boolean
          name: string
          org_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_default?: boolean
          name: string
          org_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_default?: boolean
          name?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_schedule_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_schedule_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_schedules: {
        Row: {
          admin_method: string | null
          completed_date: string | null
          created_at: string
          cycle_id: string
          deleted_at: string | null
          id: string
          notes: string | null
          org_id: string
          scheduled_date: string
          status: string
          target_age_days: number
          template_item_id: string | null
          vaccine_name: string
          verified_by_tech_id: string | null
        }
        Insert: {
          admin_method?: string | null
          completed_date?: string | null
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          org_id: string
          scheduled_date: string
          status?: string
          target_age_days: number
          template_item_id?: string | null
          vaccine_name: string
          verified_by_tech_id?: string | null
        }
        Update: {
          admin_method?: string | null
          completed_date?: string | null
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          scheduled_date?: string
          status?: string
          target_age_days?: number
          template_item_id?: string | null
          vaccine_name?: string
          verified_by_tech_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_schedules_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_schedules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_schedules_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "vaccination_template_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_schedules_verified_by_tech_id_fkey"
            columns: ["verified_by_tech_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_template_items: {
        Row: {
          admin_method: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_optional: boolean
          notes: string | null
          sequence_order: number
          target_age_days: number
          template_id: string
          vaccine_name: string
        }
        Insert: {
          admin_method?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_optional?: boolean
          notes?: string | null
          sequence_order: number
          target_age_days: number
          template_id: string
          vaccine_name: string
        }
        Update: {
          admin_method?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_optional?: boolean
          notes?: string | null
          sequence_order?: number
          target_age_days?: number
          template_id?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "vaccination_schedule_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_log_reviews: {
        Row: {
          blocks_cycle_completion: boolean
          created_at: string
          cycle_id: string
          deleted_at: string | null
          discrepancy_notes: string | null
          has_discrepancy: boolean
          id: string
          org_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          review_date: string
          status: string
          technician_id: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          blocks_cycle_completion?: boolean
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          discrepancy_notes?: string | null
          has_discrepancy?: boolean
          id?: string
          org_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_date: string
          status?: string
          technician_id: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          blocks_cycle_completion?: boolean
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          discrepancy_notes?: string | null
          has_discrepancy?: boolean
          id?: string
          org_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_date?: string
          status?: string
          technician_id?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_log_reviews_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_log_reviews_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_log_reviews_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_log_reviews_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
