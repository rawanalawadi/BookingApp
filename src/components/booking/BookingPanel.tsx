"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Consultant, SessionType } from "@/lib/types"
import BookingCalendar from "./BookingCalendar"
import TimeSlotPicker from "./TimeSlotPicker"
import SessionTypePicker from "./SessionTypePicker"
import BookingForm from "./BookingForm"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils"
import { CalendarDays, Clock4, Video, FileText, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  consultant: Consultant
}

export default function BookingPanel({ consultant }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [sessionType, setSessionType] = useState<SessionType | null>(null)

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date)
    setSelectedSlot(null)
    setSessionType(null)
  }

  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot)
    setSessionType(null)
    const onlineOnly = consultant.offersOnline !== false && !consultant.offersInPerson
    const inPersonOnly = consultant.offersInPerson && consultant.offersOnline === false
    if (onlineOnly) setSessionType("online")
    if (inPersonOnly) setSessionType("in_person")
  }

  const step = !selectedDate || !selectedSlot ? 1 : sessionType === null ? 2 : 3

  const steps = [
    { n: 1, icon: CalendarDays, label: "Date & Time" },
    { n: 2, icon: Video,        label: "Session Type" },
    { n: 3, icon: FileText,     label: "Your Details" },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6 space-y-4 md:space-y-5">
      <h2 className="font-bold text-gray-900 text-xl">Book a Session</h2>

      {/* Step progress */}
      <div className="flex items-center gap-1">
        {steps.map(({ n, label }, i) => {
          const done = step > n
          const active = step === n
          return (
            <div key={n} className="flex items-center gap-1 flex-1 last:flex-none">
              <div className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                done ? "bg-rose-500 text-white" : active ? "bg-rose-500 text-white ring-2 ring-rose-200" : "bg-gray-100 text-gray-400"
              )}>
                {done ? "✓" : n}
              </div>
              <span className={cn("text-xs truncate", active || done ? "text-rose-600 font-medium" : "text-gray-400")}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={cn("h-px flex-1 min-w-2", done ? "bg-rose-300" : "bg-gray-100")} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Calendar */}
      <div>
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
          <CalendarDays className="h-4 w-4 text-rose-500" /> Pick a Date
        </p>
        <BookingCalendar
          consultant={consultant}
          selected={selectedDate}
          onSelect={handleDateSelect}
        />
      </div>

      {/* Step 1 cont.: Time slots */}
      {selectedDate && (
        <div>
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
            <Clock4 className="h-4 w-4 text-rose-500" />
            Choose a Time
            <span className="text-gray-400 font-normal text-xs ml-1">
              — {formatDateDisplay(format(selectedDate, "yyyy-MM-dd"))}
            </span>
          </p>
          <TimeSlotPicker
            consultant={consultant}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSelect={handleSlotSelect}
          />
        </div>
      )}

      {/* Step 2: Session type */}
      {selectedDate && selectedSlot && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Video className="h-4 w-4 text-rose-500" /> Session Type
            </p>
            <button
              onClick={() => { setSelectedSlot(null); setSessionType(null) }}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
            >
              <ChevronLeft className="h-3 w-3" /> Change time
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            {formatDateDisplay(format(selectedDate, "yyyy-MM-dd"))} · {formatTimeDisplay(selectedSlot)}
          </p>
          <SessionTypePicker
            consultant={consultant}
            selected={sessionType}
            onSelect={setSessionType}
          />
        </div>
      )}

      {/* Step 3: Contact details + pay */}
      {selectedDate && selectedSlot && sessionType && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-rose-500" /> Your Details
            </p>
            <button
              onClick={() => setSessionType(null)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
            >
              <ChevronLeft className="h-3 w-3" /> Change type
            </button>
          </div>
          <BookingForm
            consultant={consultant}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            sessionType={sessionType}
          />
        </div>
      )}
    </div>
  )
}
