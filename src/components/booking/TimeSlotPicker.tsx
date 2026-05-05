"use client"

import { format } from "date-fns"
import { Consultant } from "@/lib/types"
import { formatTimeDisplay, cn } from "@/lib/utils"

interface Props {
  consultant: Consultant
  selectedDate: Date
  selectedSlot: string | null
  onSelect: (slot: string) => void
}

export default function TimeSlotPicker({
  consultant,
  selectedDate,
  selectedSlot,
  onSelect,
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
        const isSelected = selectedSlot === slot.time
        return (
          <button
            key={slot.id}
            disabled={!slot.available}
            onClick={() => onSelect(slot.time)}
            className={cn(
              "py-2 px-1 rounded-lg text-sm font-medium border transition-all",
              isSelected
                ? "bg-rose-500 text-white border-rose-500 shadow-md"
                : !slot.available
                ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                : "bg-white text-gray-700 border-gray-200 hover:border-rose-400 hover:text-rose-500"
            )}
          >
            {formatTimeDisplay(slot.time)}
          </button>
        )
      })}
    </div>
  )
}
