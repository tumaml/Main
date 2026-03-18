import { createClient } from '@supabase/supabase-js'

// Guards: use placeholder strings so createClient() doesn't throw at module
// init during Next.js build. Actual requests will fail with a descriptive
// error when env vars are not set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

// Client-side Supabase client (anon key)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (service role — server only, never expose to client)
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(url, key, { auth: { persistSession: false } })
}
