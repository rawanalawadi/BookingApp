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
        root: "w-full",
        months: "w-full",
        month: "w-full flex flex-col gap-4",
        day_selected: "bg-rose-500 text-white hover:bg-rose-600 focus:bg-rose-600",
        day_today: "border border-rose-300 text-rose-600 font-semibold",
      }}
    />
  )
}
