"use client"

import { useState, useEffect, useCallback } from "react"
import { format, addDays } from "date-fns"
import { Loader2, Lock, Unlock, CalendarDays } from "lucide-react"
import { toast } from "sonner"

interface ConsultantOption { id: string; name: string }
interface SlotRow { time: string; blocked: boolean }

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function todayStr() { return format(new Date(), "yyyy-MM-dd") }

function buildDateOptions() {
  const opts: { value: string; label: string }[] = []
  for (let i = 0; i <= 60; i++) {
    const d = addDays(new Date(), i)
    const value = format(d, "yyyy-MM-dd")
    const label = i === 0
      ? `Today · ${format(d, "EEE, MMM d")}`
      : i === 1
        ? `Tomorrow · ${format(d, "EEE, MMM d")}`
        : format(d, "EEE, MMM d")
    opts.push({ value, label })
  }
  return opts
}

export default function AdminSlotsPage() {
  const [consultants, setConsultants] = useState<ConsultantOption[]>([])
  const [consultantId, setConsultantId] = useState("")
  const [date, setDate]               = useState(todayStr())
  const [slots, setSlots]             = useState<SlotRow[] | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [toggling, setToggling]       = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/consultants")
      .then((r) => r.json())
      .then((data: ConsultantOption[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setConsultants(data)
          setConsultantId(data[0].id)
        }
      })
  }, [])

  const loadSlots = useCallback(() => {
    if (!consultantId || !date) return
    setLoadingSlots(true)
    setSlots(null)
    fetch(`/api/admin/slots?consultantId=${consultantId}&date=${date}`)
      .then((r) => r.json())
      .then((data) => { setSlots(Array.isArray(data) ? data : []); setLoadingSlots(false) })
      .catch(() => { setSlots([]); setLoadingSlots(false) })
  }, [consultantId, date])

  useEffect(() => { loadSlots() }, [loadSlots])

  async function toggleSlot(time: string) {
    setToggling(time)
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId, date, time }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setSlots((prev) => prev?.map((s) => s.time === time ? { ...s, blocked: data.blocked } : s) ?? null)
      toast.success(data.blocked ? `${time} closed.` : `${time} opened.`)
    } catch {
      toast.error("Could not update slot.")
    } finally {
      setToggling(null)
    }
  }

  const dateOptions = buildDateOptions()
  const selectedDate = date ? new Date(date + "T12:00:00") : new Date()
  const dayName = DAY_LABELS[selectedDate.getDay()]
  const openCount  = slots?.filter((s) => !s.blocked).length ?? 0
  const closedCount = slots?.filter((s) => s.blocked).length ?? 0

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Slot Manager</h1>
        <p className="text-gray-500 mt-1">Open and close individual time slots per consultant</p>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={consultantId}
          onChange={(e) => setConsultantId(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white min-w-48"
        >
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white min-w-48"
        >
          {dateOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Slot grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-semibold text-gray-900">
              {dayName}, {format(selectedDate, "MMMM d")}
            </span>
          </div>
          {slots && slots.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {openCount} open
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {closedCount} closed
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          {loadingSlots ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading slots…</span>
            </div>
          ) : !slots || slots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-gray-500">No scheduled slots for {dayName}</p>
              <p className="text-xs text-gray-400 mt-1">
                This day isn&apos;t part of the consultant&apos;s working schedule.
                <br />Update their schedule in the <a href="/admin/consultants" className="text-rose-500 hover:underline">Consultants</a> page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => toggleSlot(slot.time)}
                  disabled={toggling === slot.time}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    slot.blocked
                      ? "border-gray-200 bg-gray-50 text-gray-400 hover:border-red-200 hover:bg-red-50/40"
                      : "border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100/60"
                  } disabled:opacity-60`}
                >
                  <span>{slot.time}</span>
                  {toggling === slot.time ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : slot.blocked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        {slots && slots.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Unlock className="h-3 w-3 text-rose-500" /> Open — bookable by customers
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-gray-400" /> Closed — hidden from booking
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
