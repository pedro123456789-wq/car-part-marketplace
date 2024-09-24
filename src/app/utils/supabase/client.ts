/**
 * Create supabase browser client
 */
import { createBrowserClient } from '@supabase/ssr'

export function createFrontEndClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  )
}