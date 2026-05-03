"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Consultant, SessionType } from "@/lib/types"
import { formatCurrency, formatDateDisplay, formatTimeDisplay, cn } from "@/lib/utils"
import { CalendarCheck, Loader2, Monitor, MapPin } from "lucide-react"

interface Props {
  consultant: Consultant
  selectedDate: Date
  selectedSlot: string
  sessionType: SessionType
}

export default function BookingForm({
  consultant,
  selectedDate,
  selectedSlot,
  sessionType,
}: Props) {
  const router = useRouter()
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)

  const trimmed = summary.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < 20
  const showError = touched && tooShort
  const canSubmit = trimmed.length >= 20

  async function handleConfirm() {
    setTouched(true)
    if (!canSubmit) return
    setLoading(true)

    // Create booking (status: pending_payment)
    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultantId: consultant.id,
        consultantName: consultant.name,
        consultantSpecialty: consultant.specialty,
        consultantAvatarUrl: consultant.avatarUrl,
        date: format(selectedDate, "yyyy-MM-dd"),
        timeSlot: selectedSlot,
        sessionType,
        summary: trimmed,
        hourlyRate: consultant.hourlyRate,
      }),
    })

    const bookingData = await bookingRes.json()
    if (!bookingRes.ok) {
      toast.error(bookingData.error ?? "Failed to create booking.")
      setLoading(false)
      return
    }

    // Initiate payment → get redirect URL
    const payRes = await fetch("/api/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: bookingData.booking.id }),
    })

    const payData = await payRes.json()
    if (!payRes.ok) {
      toast.error("Payment initiation failed. Please try again.")
      setLoading(false)
      return
    }

    router.push(payData.paymentUrl)
  }

  return (
    <div className="space-y-4">
      {/* Mini summary */}
      <div className="bg-teal-50 rounded-xl p-4 text-sm space-y-1.5">
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Consultant</span>
          <span className="font-semibold">{consultant.name}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Date</span>
          <span className="font-semibold">{formatDateDisplay(format(selectedDate, "yyyy-MM-dd"))}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Time</span>
          <span className="font-semibold">{formatTimeDisplay(selectedSlot)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Type</span>
          <span className="font-semibold flex items-center gap-1">
            {sessionType === "online"
              ? <><Monitor className="h-3 w-3" /> Online</>
              : <><MapPin className="h-3 w-3" /> In Person</>}
          </span>
        </div>
        <div className="flex justify-between border-t border-teal-200 pt-2 mt-1">
          <span className="text-gray-500">Rate</span>
          <span className="font-bold text-teal-700">{formatCurrency(consultant.hourlyRate)}/hr</span>
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Briefly describe what you&apos;d like to discuss{" "}
          <span className="text-red-400">*</span>
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="e.g. I'm looking for guidance on transitioning my career into product management. I have 5 years in engineering and want to understand the best next steps…"
          rows={4}
          maxLength={500}
          className={cn(
            "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none",
            showError ? "border-red-300 bg-red-50" : "border-gray-200"
          )}
        />
        <div className="flex justify-between mt-1">
          <span className={cn("text-xs", showError ? "text-red-500" : "text-gray-400")}>
            {trimmed.length < 20 && trimmed.length > 0
              ? `${20 - trimmed.length} more characters needed`
              : ""}
          </span>
          <span className="text-xs text-gray-400">{summary.length}/500</span>
        </div>
      </div>

      <Button
        onClick={handleConfirm}
        disabled={loading || !canSubmit}
        className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to payment…
          </>
        ) : (
          <>
            <CalendarCheck className="mr-2 h-5 w-5" />
            Proceed to Payment
          </>
        )}
      </Button>
    </div>
  )
}
