"use client"

import { Calendar } from "@/components/ui/calendar"
import { format, isAfter, startOfToday } from "date-fns"
import { Consultant } from "@/lib/types"

interface Props {
  consultant: Consultant
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}

export default function BookingCalendar({ consultant, selected, onSelect }: Props) {
  const availableDates = new Set(Object.keys(consultant.availableSlots))

  function isDisabled(date: Date): boolean {
    const key = format(date, "yyyy-MM-dd")
    return !availableDates.has(key) || !isAfter(date, startOfToday())
  }

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={isDisabled}
      className="rounded-xl border border-gray-200 p-3 bg-white w-full"
      classNames={{
        day_selected: "bg-teal-600 text-white hover:bg-teal-700 focus:bg-teal-700",
        day_today: "border border-teal-300 text-teal-700 font-semibold",
      }}
    />
  )
}
