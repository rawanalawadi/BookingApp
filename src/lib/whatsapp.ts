import { Booking } from "./types"
import { formatCurrency } from "./utils"

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(time: string): string {
  const [h, min] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${String(min).padStart(2, "0")} ${ampm}`
}

export function buildConfirmationMessage(booking: Booking): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const sessionLine =
    booking.sessionType === "online" ? "🖥️ Online (Video Call)" : "📍 In Person"
  return [
    `✅ *Booking Confirmed — ConsultEase*`,
    ``,
    `Hi ${booking.customerName}! Your consultation is booked.`,
    ``,
    `👨‍💼 *Consultant:* ${booking.consultantName}`,
    `🏷️ *Specialty:* ${booking.consultantSpecialty}`,
    `📅 *Date:* ${formatDate(booking.date)}`,
    `⏰ *Time:* ${formatTime(booking.timeSlot)}`,
    `${sessionLine}`,
    `💰 *Rate:* ${formatCurrency(booking.hourlyRate)}/hr`,
    ``,
    `🔖 *Reference:* ${booking.paymentReference ?? booking.id.slice(0, 8).toUpperCase()}`,
    ``,
    `To manage or cancel your booking, visit:`,
    `${baseUrl}/manage`,
  ].join("\n")
}

export async function sendWhatsApp(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM

  if (!accountSid || !authToken || !from || accountSid === "your-twilio-account-sid") {
    // Credentials not configured — log to console in development
    console.log(`[WhatsApp mock] To: ${to}\n${message}`)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require("twilio")
  const client = twilio(accountSid, authToken)

  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`
  const fromFormatted = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`

  await client.messages.create({
    from: fromFormatted,
    to: toFormatted,
    body: message,
  })
}
