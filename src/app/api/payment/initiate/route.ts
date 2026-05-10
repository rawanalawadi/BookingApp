export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getBookingById } from "@/lib/bookings-server"

const MF_BASE_URL = process.env.MYFATOORAH_BASE_URL ?? "https://apitest.myfatoorah.com"
const MF_API_KEY  = process.env.MYFATOORAH_API_KEY  ?? ""

function isMFConfigured() {
  return MF_API_KEY.length > 0 && !MF_API_KEY.startsWith("your-")
}

// Callback must be a public HTTPS URL (MyFatoorah rejects localhost)
function callbackBase() {
  return (
    process.env.MYFATOORAH_CALLBACK_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "https://consultease.vercel.app"
  )
}

export async function POST(req: Request) {
  const { bookingId, methodId } = await req.json().catch(() => ({}))
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
  }

  const booking = await getBookingById(bookingId)
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // ── Real MyFatoorah path ────────────────────────────────────────────────────
  if (isMFConfigured()) {
    const base = callbackBase()

    const mfRes = await fetch(`${MF_BASE_URL}/v2/ExecutePayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MF_API_KEY}`,
      },
      body: JSON.stringify({
        PaymentMethodId:    methodId ?? 1,    // default to KNET if none selected
        CustomerName:       booking.customerName,
        DisplayCurrencyIso: "KWD",
        MobileCountryCode:  "+965",
        CustomerMobile:     booking.customerPhone.replace(/\D/g, "").slice(-8), // last 8 digits
        CustomerEmail:      booking.userEmail || "noreply@consultease.com",
        InvoiceValue:       booking.hourlyRate,
        CallBackUrl:        `${base}/api/payment/callback`,
        ErrorUrl:           `${base}/api/payment/callback`,
        Language:           "EN",
        CustomerReference:  bookingId,
        NotificationOption: "LNK",
      }),
      cache: "no-store",
    })

    const mfData = await mfRes.json()

    if (!mfRes.ok || !mfData.IsSuccess || !mfData.Data?.PaymentURL) {
      console.error("MyFatoorah ExecutePayment error:", mfData)
      return NextResponse.json(
        { error: mfData.Message ?? "Payment gateway error" },
        { status: 502 }
      )
    }

    return NextResponse.json({ paymentUrl: mfData.Data.PaymentURL })
  }

  // ── Mock fallback (no API key configured) ──────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001"
  return NextResponse.json({
    paymentUrl: `${baseUrl}/payment/mock?bookingId=${bookingId}`,
  })
}
