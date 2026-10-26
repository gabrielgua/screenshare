import { createClient } from '@supabase/supabase-js'
import { readPublicEnvironmentVariable } from '@/services/public-environment'

export const supabaseClient = createClient(
  readPublicEnvironmentVariable('VITE_SUPABASE_URL'),
  readPublicEnvironmentVariable('VITE_SUPABASE_PUBLISHABLE_KEY'),
)
