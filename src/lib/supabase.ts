import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side (browser) client — uses anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client — uses service role key if available, falls back to anon
// Use || (not ??) so an empty string also falls back to the anon key
export function createServerClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  })
}
