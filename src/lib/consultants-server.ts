import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { addDays, format } from "date-fns"
import { Consultant, TimeSlot } from "./types"

const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]
const DEFAULT_TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

function generateSlots(daysAhead: number, schedule?: ConsultantSchedule, blockedSlots?: string[]): Record<string, TimeSlot[]> {
  const workingDays = schedule?.workingDays ?? DEFAULT_WORKING_DAYS
  const times = schedule?.timeSlots ?? DEFAULT_TIMES
  const blocked = new Set(blockedSlots ?? [])
  const slots: Record<string, TimeSlot[]> = {}
  const today = new Date()
  for (let i = 1; i <= daysAhead; i++) {
    const date = addDays(today, i)
    if (!workingDays.includes(date.getDay())) continue
    const key = format(date, "yyyy-MM-dd")
    slots[key] = times.map((time) => ({
      id: `${key}-${time}`,
      time,
      available: !blocked.has(`${key}-${time}`),
    }))
  }
  return slots
}

export function toggleSlot(consultantId: string, date: string, time: string): { blocked: boolean } | null {
  const metas = getConsultantMetas()
  const idx = metas.findIndex((m) => m.id === consultantId)
  if (idx === -1) return null
  const key = `${date}-${time}`
  const current = metas[idx].blockedSlots ?? []
  const isBlocked = current.includes(key)
  metas[idx].blockedSlots = isBlocked ? current.filter((s) => s !== key) : [...current, key]
  saveConsultantMetas(metas)
  return { blocked: !isBlocked }
}

export function getSlotsForDate(consultantId: string, date: string): { time: string; blocked: boolean }[] | null {
  const metas = getConsultantMetas()
  const meta = metas.find((m) => m.id === consultantId)
  if (!meta) return null
  const times = meta.schedule?.timeSlots ?? DEFAULT_TIMES
  const workingDays = meta.schedule?.workingDays ?? DEFAULT_WORKING_DAYS
  const dayOfWeek = new Date(date + "T12:00:00").getDay()
  if (!workingDays.includes(dayOfWeek)) return []
  const blocked = new Set(meta.blockedSlots ?? [])
  return times.map((time) => ({ time, blocked: blocked.has(`${date}-${time}`) }))
}

export interface ConsultantSchedule {
  workingDays: number[]
  timeSlots: string[]
}

export type ConsultantMeta = Omit<Consultant, "availableSlots"> & {
  schedule?: ConsultantSchedule
  blockedSlots?: string[]
}

function getFilePath(): string {
  return path.join(process.cwd(), "src/lib/consultants.json")
}

export function getConsultantMetas(): ConsultantMeta[] {
  try {
    const raw = readFileSync(getFilePath(), "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveConsultantMetas(metas: ConsultantMeta[]): void {
  writeFileSync(getFilePath(), JSON.stringify(metas, null, 2))
}

function getBookedSlotKeys(consultantId: string): Set<string> {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src/lib/bookings.json"), "utf-8")
    const bookings: Array<{ consultantId: string; date: string; timeSlot: string; status: string }> = JSON.parse(raw)
    return new Set(
      bookings
        .filter((b) => b.consultantId === consultantId && (b.status === "confirmed" || b.status === "pending"))
        .map((b) => `${b.date}-${b.timeSlot}`)
    )
  } catch { return new Set() }
}

export function getConsultantWithSchedule(id: string): Consultant | null {
  const metas = getConsultantMetas()
  const meta = metas.find((m) => m.id === id)
  if (!meta) return null
  const { schedule, blockedSlots, ...rest } = meta
  const booked = getBookedSlotKeys(id)
  const allBlocked = (blockedSlots ?? []).concat(Array.from(booked))
  return { ...rest, availableSlots: generateSlots(30, schedule, allBlocked) }
}

export function getAllConsultantsWithSchedules(): Consultant[] {
  return getConsultantMetas().map(({ schedule, blockedSlots, id, ...rest }) => {
    const booked = getBookedSlotKeys(id)
    const allBlocked = (blockedSlots ?? []).concat(Array.from(booked))
    return { id, ...rest, availableSlots: generateSlots(30, schedule, allBlocked) }
  })
}
