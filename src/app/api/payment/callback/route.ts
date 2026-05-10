export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getBookingById, updateBookingStatus } from "@/lib/bookings-server"
import { buildConfirmationMessage, sendWhatsApp } from "@/lib/whatsapp"

const MF_BASE_URL = process.env.MYFATOORAH_BASE_URL ?? "https://apitest.myfatoorah.com"
const MF_API_KEY  = process.env.MYFATOORAH_API_KEY  ?? ""

function isMFConfigured() {
  return MF_API_KEY.length > 0 && !MF_API_KEY.startsWith("your-")
}

async function verifyPayment(paymentId: string): Promise<{
  success: boolean
  bookingId: string | null
  invoiceId: string | null
}> {
  const res = await fetch(`${MF_BASE_URL}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MF_API_KEY}`,
    },
    body: JSON.stringify({ Key: paymentId, KeyType: "PaymentId" }),
    cache: "no-store",
  })

  const data = await res.json()
  if (!res.ok || !data.IsSuccess) {
    return { success: false, bookingId: null, invoiceId: null }
  }

  const status = data.Data?.InvoiceStatus   // "Paid" | "Pending" | "Canceled"
  const bookingId = data.Data?.CustomerReference ?? null
  const invoiceId = String(data.Data?.InvoiceId ?? "")

  return { success: status === "Paid", bookingId, invoiceId }
}

// MyFatoorah redirects users back via GET with ?paymentId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get("paymentId")

  // No paymentId in query → something went wrong before payment started
  if (!paymentId) {
    redirect("/consultants?error=payment_cancelled")
  }

  // ── Real MyFatoorah verification ───────────────────────────────────────────
  if (isMFConfigured()) {
    const { success, bookingId, invoiceId } = await verifyPayment(paymentId)

    if (!success || !bookingId) {
      redirect(`/consultants?error=payment_failed`)
    }

    // Idempotent — safe to call even if already confirmed
    const existing = await getBookingById(bookingId!)
    if (existing && existing.status !== "confirmed") {
      const confirmed = await updateBookingStatus(bookingId!, "confirmed", invoiceId ?? paymentId)

      // Fire WhatsApp confirmation (non-fatal)
      if (confirmed) {
        try {
          const message = buildConfirmationMessage(confirmed)
          await sendWhatsApp(confirmed.customerPhone, message)
        } catch { /* non-fatal */ }
      }
    }

    redirect(`/booking/confirmation?id=${bookingId}`)
  }

  // ── Mock fallback (POST from mock payment page) ────────────────────────────
  // The mock page posts directly to this route, handled below in POST
  redirect("/consultants")
}

// Legacy POST handler — used by the mock payment page
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  const bookingId: string = body.bookingId ?? body.CustomerReference
  const paymentReference: string = body.paymentId ?? body.InvoiceId ?? `PAY-${Date.now()}`

  if (!bookingId) {
    return Response.json({ error: "Missing bookingId" }, { status: 400 })
  }

  const existing = await getBookingById(bookingId)
  if (!existing) {
    return Response.json({ error: "Booking not found" }, { status: 404 })
  }

  const confirmed = await updateBookingStatus(bookingId, "confirmed", paymentReference)
  if (!confirmed) {
    return Response.json({ error: "Failed to confirm booking" }, { status: 500 })
  }

  try {
    const message = buildConfirmationMessage(confirmed)
    await sendWhatsApp(confirmed.customerPhone, message)
  } catch { /* non-fatal */ }

  return Response.json({ bookingId, status: "confirmed" })
}
