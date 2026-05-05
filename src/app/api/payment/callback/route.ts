import { NextResponse } from "next/server"
import { getBookingById, updateBookingStatus } from "@/lib/bookings-server"
import { buildConfirmationMessage, sendWhatsApp } from "@/lib/whatsapp"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  const bookingId: string = body.bookingId ?? body.CustomerReference
  const paymentReference: string = body.paymentId ?? body.InvoiceId ?? `PAY-${Date.now()}`

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
  }

  const existing = getBookingById(bookingId)
  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const confirmed = updateBookingStatus(bookingId, "confirmed", paymentReference)
  if (!confirmed) {
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 })
  }

  // Send WhatsApp confirmation
  try {
    const message = buildConfirmationMessage(confirmed)
    await sendWhatsApp(confirmed.customerPhone, message)
  } catch {
    // Non-fatal — booking is confirmed regardless
  }

  return NextResponse.json({ bookingId, status: "confirmed" })
}
