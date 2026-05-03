"use client"

import { format } from "date-fns"
import { Consultant } from "@/lib/types"
import { isSlotBooked } from "@/lib/bookings"
import { formatTimeDisplay, cn } from "@/lib/utils"

interface Props {
  consultant: Consultant
  selectedDate: Date
  selectedSlot: string | null
  onSelect: (slot: string) => void
  userEmail: string
}

export default function TimeSlotPicker({
  consultant,
  selectedDate,
  selectedSlot,
  onSelect,
  userEmail,
}: Props) {
  const dateKey = format(selectedDate, "yyyy-MM-dd")
  const slots = consultant.availableSlots[dateKey] ?? []

  if (slots.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No slots available for this date.</p>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const booked = isSlotBooked(userEmail, consultant.id, dateKey, slot.time)
        const isSelected = selectedSlot === slot.time

        return (
          <button
            key={slot.id}
            disabled={booked}
            onClick={() => onSelect(slot.time)}
            className={cn(
              "py-2 px-1 rounded-lg text-sm font-medium border transition-all",
              isSelected
                ? "bg-teal-600 text-white border-teal-600 shadow-md"
                : booked
                ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                : "bg-white text-gray-700 border-gray-200 hover:border-teal-400 hover:text-teal-600"
            )}
          >
            {formatTimeDisplay(slot.time)}
          </button>
        )
      })}
    </div>
  )
}
