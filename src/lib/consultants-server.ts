import { createServerClient } from "./supabase"
import { addDays, format } from "date-fns"
import { Consultant, TimeSlot } from "./types"

const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]
const DEFAULT_TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

export interface ConsultantSchedule {
  workingDays: number[]
  timeSlots: string[]
}

export type ConsultantMeta = Omit<Consultant, "availableSlots"> & {
  schedule?: ConsultantSchedule
  blockedSlots?: string[]
}

// ── helpers ──────────────────────────────────────────────────────────────────

function rowToMeta(row: Record<string, unknown>): ConsultantMeta {
  return {
    id:             row.id as string,
    name:           row.name as string,
    specialty:      row.specialty as string,
    bio:            row.bio as string,
    avatarUrl:      row.avatar_url as string,
    hourlyRate:     Number(row.hourly_rate),
    rating:         Number(row.rating),
    reviewCount:    Number(row.review_count),
    tags:           (row.tags as string[]) ?? [],
    offersOnline:   row.offers_online as boolean,
    offersInPerson: row.offers_in_person as boolean,
    schedule: {
      workingDays: (row.working_days as number[]) ?? DEFAULT_WORKING_DAYS,
      timeSlots:   (row.time_slots  as string[]) ?? DEFAULT_TIMES,
    },
  }
}

function generateSlots(
  daysAhead: number,
  schedule?: ConsultantSchedule,
  blockedKeys?: Set<string>
): Record<string, TimeSlot[]> {
  const workingDays = schedule?.workingDays ?? DEFAULT_WORKING_DAYS
  const times       = schedule?.timeSlots   ?? DEFAULT_TIMES
  const blocked     = blockedKeys ?? new Set<string>()
  const slots: Record<string, TimeSlot[]> = {}
  const today = new Date()
  for (let i = 1; i <= daysAhead; i++) {
    const date = addDays(today, i)
    if (!workingDays.includes(date.getDay())) continue
    const key = format(date, "yyyy-MM-dd")
    slots[key] = times.map((time) => ({
      id:        `${key}-${time}`,
      time,
      available: !blocked.has(`${key}-${time}`),
    }))
  }
  return slots
}

async function getBookedSlotKeys(consultantId: string): Promise<Set<string>> {
  const sb = createServerClient()
  const { data } = await sb
    .from("bookings")
    .select("date, time_slot")
    .eq("consultant_id", consultantId)
    .in("status", ["confirmed", "pending"])
  return new Set((data ?? []).map((b) => `${b.date}-${b.time_slot}`))
}

async function getBlockedSlotKeys(consultantId: string): Promise<Set<string>> {
  const sb = createServerClient()
  const { data } = await sb
    .from("blocked_slots")
    .select("date, time")
    .eq("consultant_id", consultantId)
  return new Set((data ?? []).map((b) => `${b.date}-${b.time}`))
}

// ── public API ───────────────────────────────────────────────────────────────

export async function getConsultantMetas(): Promise<ConsultantMeta[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("consultants")
    .select("*")
    .order("name")
  if (error) throw error
  return (data ?? []).map(rowToMeta)
}

export async function getConsultantMetaById(id: string): Promise<ConsultantMeta | null> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("consultants")
    .select("*")
    .eq("id", id)
    .single()
  if (error || !data) return null
  return rowToMeta(data)
}

export async function saveConsultantMeta(meta: ConsultantMeta): Promise<void> {
  const sb = createServerClient()
  const { error } = await sb.from("consultants").upsert({
    id:              meta.id,
    name:            meta.name,
    specialty:       meta.specialty,
    bio:             meta.bio,
    avatar_url:      meta.avatarUrl,
    hourly_rate:     meta.hourlyRate,
    rating:          meta.rating,
    review_count:    meta.reviewCount,
    tags:            meta.tags,
    offers_online:   meta.offersOnline ?? true,
    offers_in_person: meta.offersInPerson ?? false,
    working_days:    meta.schedule?.workingDays ?? DEFAULT_WORKING_DAYS,
    time_slots:      meta.schedule?.timeSlots ?? DEFAULT_TIMES,
  })
  if (error) throw error
}

export async function deleteConsultantMeta(id: string): Promise<void> {
  const sb = createServerClient()
  const { error } = await sb.from("consultants").delete().eq("id", id)
  if (error) throw error
}

export async function getConsultantWithSchedule(id: string): Promise<Consultant | null> {
  const meta = await getConsultantMetaById(id)
  if (!meta) return null
  const [booked, blocked] = await Promise.all([
    getBookedSlotKeys(id),
    getBlockedSlotKeys(id),
  ])
  const allBlocked = new Set(Array.from(booked).concat(Array.from(blocked)))
  return { ...meta, availableSlots: generateSlots(30, meta.schedule, allBlocked) }
}

export async function getAllConsultantsWithSchedules(): Promise<Consultant[]> {
  const metas = await getConsultantMetas()
  return Promise.all(
    metas.map(async (meta) => {
      const [booked, blocked] = await Promise.all([
        getBookedSlotKeys(meta.id),
        getBlockedSlotKeys(meta.id),
      ])
      const allBlocked = new Set(Array.from(booked).concat(Array.from(blocked)))
      return { ...meta, availableSlots: generateSlots(30, meta.schedule, allBlocked) }
    })
  )
}

export async function getSlotsForDate(
  consultantId: string,
  date: string
): Promise<{ time: string; blocked: boolean }[] | null> {
  const meta = await getConsultantMetaById(consultantId)
  if (!meta) return null
  const times       = meta.schedule?.timeSlots   ?? DEFAULT_TIMES
  const workingDays = meta.schedule?.workingDays ?? DEFAULT_WORKING_DAYS
  const dayOfWeek   = new Date(date + "T12:00:00").getDay()
  if (!workingDays.includes(dayOfWeek)) return []
  const [booked, blocked] = await Promise.all([
    getBookedSlotKeys(consultantId),
    getBlockedSlotKeys(consultantId),
  ])
  const allBlocked = new Set(Array.from(booked).concat(Array.from(blocked)))
  return times.map((time) => ({ time, blocked: allBlocked.has(`${date}-${time}`) }))
}

export async function toggleSlot(
  consultantId: string,
  date: string,
  time: string
): Promise<{ blocked: boolean } | null> {
  const meta = await getConsultantMetaById(consultantId)
  if (!meta) return null
  const sb = createServerClient()
  const { data: existing } = await sb
    .from("blocked_slots")
    .select("id")
    .eq("consultant_id", consultantId)
    .eq("date", date)
    .eq("time", time)
    .maybeSingle()
  if (existing) {
    await sb.from("blocked_slots").delete().eq("id", existing.id)
    return { blocked: false }
  } else {
    await sb.from("blocked_slots").insert({ consultant_id: consultantId, date, time })
    return { blocked: true }
  }
}

// Legacy compat
export async function saveConsultantMetas(metas: ConsultantMeta[]): Promise<void> {
  await Promise.all(metas.map(saveConsultantMeta))
}
