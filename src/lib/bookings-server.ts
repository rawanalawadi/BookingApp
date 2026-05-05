import { createServerClient } from "./supabase"
import { Booking } from "./types"

// ── helpers ──────────────────────────────────────────────────────────────────

function rowToBooking(row: Record<string, unknown>): Booking {
  return {
    id:                    row.id as string,
    userEmail:             row.user_email as string | undefined,
    customerName:          row.customer_name as string,
    customerPhone:         row.customer_phone as string,
    consultantId:          row.consultant_id as string,
    consultantName:        row.consultant_name as string,
    consultantSpecialty:   row.consultant_specialty as string,
    consultantAvatarUrl:   row.consultant_avatar_url as string,
    date:                  row.date as string,
    timeSlot:              row.time_slot as string,
    sessionType:           row.session_type as Booking["sessionType"],
    notes:                 row.notes as string | undefined,
    status:                row.status as Booking["status"],
    hourlyRate:            Number(row.hourly_rate),
    paymentReference:      row.payment_reference as string | undefined,
    createdAt:             row.created_at as string,
  }
}

// ── public API ───────────────────────────────────────────────────────────────

export async function getAllBookings(): Promise<Booking[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToBooking)
}

export async function getBookingsByUser(email: string): Promise<Booking[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToBooking)
}

export async function getBookingsByPhone(phone: string): Promise<Booking[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToBooking)
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single()
  if (error || !data) return null
  return rowToBooking(data)
}

export async function addBookingServer(booking: Booking): Promise<Booking> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("bookings")
    .insert({
      id:                    booking.id,
      user_email:            booking.userEmail ?? null,
      customer_name:         booking.customerName,
      customer_phone:        booking.customerPhone,
      consultant_id:         booking.consultantId,
      consultant_name:       booking.consultantName,
      consultant_specialty:  booking.consultantSpecialty,
      consultant_avatar_url: booking.consultantAvatarUrl,
      date:                  booking.date,
      time_slot:             booking.timeSlot,
      session_type:          booking.sessionType,
      notes:                 booking.notes ?? null,
      status:                booking.status,
      hourly_rate:           booking.hourlyRate,
      payment_reference:     booking.paymentReference ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToBooking(data)
}

export async function cancelBookingServer(id: string): Promise<boolean> {
  const sb = createServerClient()
  const { error } = await sb
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
  return !error
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"],
  paymentReference?: string
): Promise<Booking | null> {
  const sb = createServerClient()
  const patch: Record<string, unknown> = { status }
  if (paymentReference) patch.payment_reference = paymentReference
  const { data, error } = await sb
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .select()
    .single()
  if (error || !data) return null
  return rowToBooking(data)
}

export async function modifyBookingServer(
  id: string,
  fields: Pick<Booking, "date" | "timeSlot" | "sessionType"> & { notes?: string }
): Promise<Booking | null> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from("bookings")
    .update({
      date:         fields.date,
      time_slot:    fields.timeSlot,
      session_type: fields.sessionType,
      notes:        fields.notes ?? null,
    })
    .eq("id", id)
    .select()
    .single()
  if (error || !data) return null
  return rowToBooking(data)
}

export async function isSlotBooked(
  consultantId: string,
  date: string,
  timeSlot: string
): Promise<boolean> {
  const sb = createServerClient()
  const { count } = await sb
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("consultant_id", consultantId)
    .eq("date", date)
    .eq("time_slot", timeSlot)
    .in("status", ["confirmed", "pending"])
  return (count ?? 0) > 0
}

// Legacy sync aliases kept for backward compat — wrap in async context
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function saveAllBookings(_bookings: Booking[]): void {
  // no-op — Supabase is source of truth
}
