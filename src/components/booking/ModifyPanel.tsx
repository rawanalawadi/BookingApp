"use client"

import { useState } from "react"
import { format, parseISO, isAfter, startOfToday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Booking, Consultant, SessionType } from "@/lib/types"
import { formatTimeDisplay, cn } from "@/lib/utils"
import { Loader2, Monitor, MapPin, Check } from "lucide-react"

interface Props {
  booking: Booking
  consultant: Consultant
  phone: string
  onSave: (updated: Booking) => void
  onCancel: () => void
}

export default function ModifyPanel({ booking, consultant, phone, onSave, onCancel }: Props) {
  const today = startOfToday()

  const availableDates = Object.keys(consultant.availableSlots)
    .filter((d) => isAfter(parseISO(d), today) || format(today, "yyyy-MM-dd") === d)
    .sort()

  const [date, setDate] = useState(booking.date)
  const [slot, setSlot] = useState(booking.timeSlot)
  const [sessionType, setSessionType] = useState<SessionType>(booking.sessionType)
  const [notes, setNotes] = useState(booking.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const slotsForDate = (consultant.availableSlots[date] ?? []).filter((s) => s.available)

  function handleDateChange(d: string) {
    setDate(d)
    // keep current slot only if it exists on new date
    const exists = (consultant.availableSlots[d] ?? []).some((s) => s.available && s.time === slot)
    if (!exists) setSlot("")
  }

  const canSave = date.length > 0 && slot.length > 0

  async function handleSave() {
    if (!canSave) { setError("Please select a date and time slot."); return }
    setSaving(true)
    setError("")

    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "modify",
        phone,
        date,
        timeSlot: slot,
        sessionType,
        notes: notes.trim() || undefined,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? "Failed to update booking.")
      return
    }

    onSave(data.booking)
  }

  const showSessionTypePicker =
    consultant.offersOnline !== false && consultant.offersInPerson !== false

  return (
    <div className="px-5 pb-5 pt-4 border-t border-gray-100 space-y-4 bg-gray-50/60">
      <p className="text-sm font-semibold text-gray-800">Reschedule Session</p>

      {/* Date chips */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Choose a date</p>
        {availableDates.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No upcoming availability found.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => handleDateChange(d)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                  date === d
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700"
                )}
              >
                {format(parseISO(d), "EEE, MMM d")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time slot chips */}
      {date && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Choose a time</p>
          {slotsForDate.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No available slots for this date.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {slotsForDate.map((s) => (
                <button
                  key={s.time}
                  onClick={() => setSlot(s.time)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                    slot === s.time
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700"
                  )}
                >
                  {formatTimeDisplay(s.time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Session type */}
      {showSessionTypePicker && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Session type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSessionType("online")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border font-medium transition-colors",
                sessionType === "online"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
              )}
            >
              <Monitor className="h-3.5 w-3.5" /> Online
            </button>
            <button
              onClick={() => setSessionType("in_person")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border font-medium transition-colors",
                sessionType === "in_person"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-400"
              )}
            >
              <MapPin className="h-3.5 w-3.5" /> In Person
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">
          Notes <span className="font-normal text-gray-400">(optional)</span>
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any updates for the consultant…"
          rows={2}
          maxLength={500}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1 text-xs border-gray-200 text-gray-600"
        >
          Discard
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !canSave}
          className="flex-1 text-xs bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <><Check className="h-3.5 w-3.5 mr-1" /> Save Changes</>
          )}
        </Button>
      </div>
    </div>
  )
}
