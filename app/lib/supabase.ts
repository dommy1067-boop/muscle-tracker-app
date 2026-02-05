// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  name: string
  weight: number | null
  goal: 'bulk' | 'cut' | 'maintain' | null
  target_calories: number | null
  created_at: string
  updated_at: string
}

export type Meal = {
  id: string
  user_id: string
  image_url: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  evaluation: string | null
  created_at: string
}