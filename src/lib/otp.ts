import { createServerClient } from "./supabase"

export function createOTP(phone: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Fire-and-forget — callers don't await this
  const sb = createServerClient()
  sb.from("otp_codes")
    .delete()
    .eq("phone", phone)
    .then(() =>
      sb.from("otp_codes").insert({ phone, code, expires_at: expiresAt, used: false })
    )

  return code
}

export type OTPResult = "valid" | "invalid" | "expired" | "used"

export async function verifyOTP(phone: string, code: string): Promise<OTPResult> {
  const sb = createServerClient()

  const { data } = await sb
    .from("otp_codes")
    .select("id, code, expires_at, used")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return "invalid"
  if (data.used) return "used"
  if (new Date(data.expires_at) < new Date()) return "expired"
  if (data.code !== String(code).trim()) return "invalid"

  await sb.from("otp_codes").update({ used: true }).eq("id", data.id)
  return "valid"
}
