"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Booking } from "@/lib/types"
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShieldCheck, Lock, Loader2, CreditCard, Monitor, MapPin } from "lucide-react"
import Image from "next/image"

function MockPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const bookingId = searchParams.get("bookingId") ?? ""

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        setBooking(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookingId])

  async function handlePay() {
    if (!booking) return
    setPaying(true)

    const res = await fetch("/api/payment/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        userEmail: session?.user?.email,
        paymentId: `MOCK-PAY-${Date.now()}`,
        InvoiceId: `INV-${Date.now()}`,
        CustomerReference: bookingId,
      }),
    })

    if (res.ok) {
      router.push(`/booking/confirmation?id=${bookingId}`)
    } else {
      setPaying(false)
      alert("Payment failed. Please try again.")
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Lock className="h-3.5 w-3.5" />
          Secure Payment — MyFatoorah (Test Mode)
        </div>
        <p className="text-gray-500 text-sm">
          This is a simulated payment page. No real transaction will occur.
        </p>
      </div>

      {/* Booking summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : booking ? (
          <>
            <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0">
                <Image
                  src={booking.consultantAvatarUrl}
                  alt={booking.consultantName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{booking.consultantName}</p>
                <p className="text-rose-100 text-xs">{booking.consultantSpecialty}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-white font-bold text-lg">{formatCurrency(booking.hourlyRate)}</p>
                <p className="text-rose-100 text-xs">per hour</p>
              </div>
            </div>

            <div className="px-5 py-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span className="text-gray-400">Date</span>
                <span className="font-medium">{formatDateDisplay(booking.date)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="text-gray-400">Time</span>
                <span className="font-medium">{formatTimeDisplay(booking.timeSlot)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="text-gray-400">Session</span>
                <span className="flex items-center gap-1 font-medium">
                  {booking.sessionType === "online"
                    ? <><Monitor className="h-3 w-3" /> Online</>
                    : <><MapPin className="h-3 w-3" /> In Person</>}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="text-gray-500 font-medium">Total Due</span>
                <span className="font-bold text-rose-600 text-base">{formatCurrency(booking.hourlyRate)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">Booking not found.</div>
        )}
      </div>

      {/* Mock card UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Payment Method</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["Visa", "Mastercard", "Mada", "Apple Pay"].map((method) => (
            <div
              key={method}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-center text-gray-500 font-medium"
            >
              {method}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Card number"
            defaultValue="4242 4242 4242 4242"
            readOnly
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="MM/YY"
              defaultValue="12/26"
              readOnly
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50"
            />
            <input
              type="text"
              placeholder="CVV"
              defaultValue="***"
              readOnly
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50"
            />
          </div>
        </div>

        <Button
          onClick={handlePay}
          disabled={paying || loading || !booking}
          className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base shadow-md"
        >
          {paying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-5 w-5" />
              Pay {booking ? formatCurrency(booking.hourlyRate) : ""}
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400">
        Secured by MyFatoorah · SSL encrypted
      </p>
    </div>
  )
}

export default function MockPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <Suspense fallback={
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      }>
        <MockPaymentContent />
      </Suspense>
    </div>
  )
}
