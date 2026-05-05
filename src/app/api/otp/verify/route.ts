import { verifyOTP } from "@/lib/otp"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const phone: string | undefined = body.phone
  const code: string | undefined = body.code

  if (!phone?.trim() || !code?.trim()) {
    return Response.json({ error: "Phone and code are required" }, { status: 400 })
  }

  const result = await verifyOTP(phone.trim(), code.trim())

  if (result === "valid") {
    return Response.json({ valid: true })
  }

  const errors: Record<string, string> = {
    expired: "Code has expired. Please request a new one.",
    used: "Code has already been used. Please request a new one.",
    invalid: "Incorrect code. Please try again.",
  }

  return Response.json({ valid: false, error: errors[result] ?? "Invalid code." }, { status: 400 })
}
