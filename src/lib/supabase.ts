import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwtgsrxdqiumiwlzfsnq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dGdzcnhkcWl1bWl3bHpmc25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjU3MTUsImV4cCI6MjA4Njk0MTcxNX0.zmWrYp2V1URfLlA-fwG3cDCceHG9OvuwdH7BQGvDabY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ─── DB Row Types ────────────────────────────────────────────────────────────

export interface TripRow {
  id: string
  created_at: string
  updated_at: string
  owner_id: string
  name: string
  destination: string
  emoji: string
  start_date: string | null
  end_date: string | null
  cover_gradient: string | null
  cover_image: string | null
}

export interface TravelerRow {
  id: string
  trip_id: string
  name: string
  color: string
  emoji: string
  user_id: string | null
  created_at: string
}

export interface EventRow {
  id: string
  trip_id: string
  created_at: string
  updated_at: string
  type: string
  date: string
  time: string | null
  title: string
  data: Record<string, unknown>
  position: number
}

export interface ExpenseRow {
  id: string
  trip_id: string
  created_at: string
  description: string
  amount: number
  currency: string
  category: string
  date: string | null
  paid_by_traveler_id: string | null
  split_between: string[]
  settled: boolean
}

export interface PackItemRow {
  id: string
  trip_id: string
  text: string
  checked: boolean
  category: string
  created_at: string
}
