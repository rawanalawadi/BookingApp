import { NextResponse } from "next/server"
import { getBookingById } from "@/lib/bookings-server"

export async function POST(req: Request) {
  const { bookingId } = await req.json().catch(() => ({}))
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
  }

  const booking = getBookingById(bookingId)
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // ── MyFatoorah integration (activate when real credentials are available) ──
  // const mfRes = await fetch(`${process.env.MYFATOORAH_BASE_URL}/v2/ExecutePayment`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     PaymentMethodId: 2,
  //     CustomerName: booking.customerName,
  //     NotificationOption: "LNK",
  //     DisplayCurrencyIso: "SAR",
  //     MobileCountryCode: "+966",
  //     CustomerMobile: booking.customerPhone,
  //     CustomerEmail: booking.userEmail ?? "",
  //     InvoiceValue: booking.hourlyRate,
  //     CallBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
  //     ErrorUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
  //     Language: "EN",
  //     CustomerReference: bookingId,
  //   }),
  // })
  // const mfData = await mfRes.json()
  // if (!mfRes.ok || !mfData.Data?.PaymentURL) {
  //   return NextResponse.json({ error: "Payment gateway error" }, { status: 502 })
  // }
  // return NextResponse.json({ paymentUrl: mfData.Data.PaymentURL })
  // ──────────────────────────────────────────────────────────────────────────

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  return NextResponse.json({
    paymentUrl: `${baseUrl}/payment/mock?bookingId=${bookingId}`,
  })
}
