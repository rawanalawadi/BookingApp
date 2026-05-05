"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Booking } from "@/lib/types"
import { ArrowLeft, Monitor, MapPin, User, Mail, Phone, FileText, CreditCard, Loader2, CheckCircle2, XCircle, CheckCheck } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const STATUS_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-400", bg: "bg-amber-50",  text: "text-amber-700"  },
  confirmed: { label: "Confirmed", dot: "bg-rose-500",  bg: "bg-rose-50",   text: "text-rose-600"   },
  completed: { label: "Completed", dot: "bg-blue-500",  bg: "bg-blue-50",   text: "text-blue-700"   },
  cancelled: { label: "Cancelled", dot: "bg-red-400",   bg: "bg-red-50",    text: "text-red-700"    },
}

function fmt(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
}

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setBooking(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function changeStatus(newStatus: string) {
    if (!booking) return
    setActing(newStatus)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed")
      const updated = await res.json()
      setBooking(updated)
      toast.success(`Booking marked as ${newStatus}.`)
    } catch {
      toast.error("Could not update status.")
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">Booking not found.</p>
        <Link href="/admin/bookings" className="text-sm text-rose-500 hover:underline mt-2 inline-block">← Back to bookings</Link>
      </div>
    )
  }

  const s = STATUS_META[booking.status] ?? STATUS_META.pending

  return (
    <div className="p-8 max-w-2xl">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{booking.consultantName}</h1>
          <p className="text-gray-500 mt-1">{booking.consultantSpecialty}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {/* Date + time + session */}
        <div className="px-6 py-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Date</p>
            <p className="text-sm font-semibold text-gray-900">{fmt(booking.date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Time</p>
            <p className="text-sm font-semibold text-gray-900">{booking.timeSlot}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Session</p>
            <span className={`inline-flex items-center gap-1 text-sm font-medium ${booking.sessionType === "online" ? "text-blue-600" : "text-orange-600"}`}>
              {booking.sessionType === "online" ? <Monitor className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              {booking.sessionType === "online" ? "Online" : "In-Person"}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Customer</p>
          <div className="space-y-2">
            {booking.customerName && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {booking.customerName}
              </div>
            )}
            {booking.userEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {booking.userEmail}
              </div>
            )}
            {booking.customerPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {booking.customerPhone}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="px-6 py-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Notes</p>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">{booking.notes}</p>
            </div>
          </div>
        )}

        {/* Payment */}
        {booking.paymentReference && (
          <div className="px-6 py-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Payment</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="font-mono">{booking.paymentReference}</span>
              <span className="text-gray-400">· ${booking.hourlyRate}/hr</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {booking.status !== "cancelled" && (
        <div className="mt-6 flex flex-wrap gap-3">
          {booking.status !== "confirmed" && booking.status !== "completed" && (
            <button
              onClick={() => changeStatus("confirmed")}
              disabled={!!acting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {acting === "confirmed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirm Booking
            </button>
          )}
          {booking.status !== "completed" && (
            <button
              onClick={() => changeStatus("completed")}
              disabled={!!acting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {acting === "completed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              Mark as Done
            </button>
          )}
          <button
            onClick={() => changeStatus("cancelled")}
            disabled={!!acting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {acting === "cancelled" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
