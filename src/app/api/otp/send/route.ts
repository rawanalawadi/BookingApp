import { createOTP } from "@/lib/otp"
import { sendWhatsApp } from "@/lib/whatsapp"
import { normalizePhone } from "@/lib/utils"

function isTwilioConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID
  return !(!sid || sid === "your-twilio-account-sid")
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const phone: string | undefined = body.phone

  if (!phone?.trim()) {
    return Response.json({ error: "Phone number is required" }, { status: 400 })
  }

  const normalized = normalizePhone(phone)
  const code = createOTP(normalized)
  const message = [
    `🔐 *ConsultEase Verification Code*`,
    ``,
    `Your code is: *${code}*`,
    ``,
    `This code expires in 10 minutes. Do not share it with anyone.`,
  ].join("\n")

  await sendWhatsApp(normalized, message)

  // In sandbox mode (Twilio not configured), return the code so it can be
  // displayed on-screen for testing. Never returned when Twilio is live.
  const sandboxCode = isTwilioConfigured() ? undefined : code

  return Response.json({ sent: true, sandboxCode })
}
