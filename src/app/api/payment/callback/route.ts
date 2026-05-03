import { NextResponse } from "next/server"
import { getBookingById, updateBookingStatus } from "@/lib/bookings-server"
import { Resend } from "resend"
import BookingConfirmationEmail from "@/emails/BookingConfirmationEmail"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  // MyFatoorah posts back CustomerReference as the bookingId
  const bookingId: string = body.bookingId ?? body.CustomerReference
  const paymentReference: string = body.paymentId ?? body.InvoiceId ?? `PAY-${Date.now()}`
  const userEmail: string | undefined = body.userEmail

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

  // Send confirmation email if Resend is configured
  const resendKey = process.env.RESEND_API_KEY
  const emailTo = userEmail ?? existing.userEmail
  if (resendKey && resendKey !== "re_placeholder" && emailTo) {
    try {
      const resend = new Resend(resendKey)
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        to: emailTo,
        subject: `Booking Confirmed — ${confirmed.consultantName}`,
        react: BookingConfirmationEmail({ booking: confirmed }),
      })
    } catch {
      // Email failure is non-fatal
    }
  }

  return NextResponse.json({ bookingId, status: "confirmed" })
}
