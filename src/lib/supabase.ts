import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side (browser) client — uses anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client — uses service role key if available, falls back to anon
// Use || (not ??) so an empty string also falls back to the anon key.
// Pass a custom fetch with cache:'no-store' so Next.js never caches Supabase
// responses — changes in the dashboard are reflected immediately.
export function createServerClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
    global: {
      fetch: (url: RequestInfo | URL, options?: RequestInit) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  })
}
