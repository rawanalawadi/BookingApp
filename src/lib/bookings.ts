import { Booking } from "./types"

function getKey(email: string): string {
  return `consultease_bookings_${email}`
}

export function getBookings(email: string): Booking[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(getKey(email))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveBookings(email: string, bookings: Booking[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(getKey(email), JSON.stringify(bookings))
}

export function addBooking(email: string, booking: Booking): void {
  const bookings = getBookings(email)
  bookings.push(booking)
  saveBookings(email, bookings)
}

export function cancelBooking(email: string, id: string): void {
  const bookings = getBookings(email).map((b) =>
    b.id === id ? { ...b, status: "cancelled" as const } : b
  )
  saveBookings(email, bookings)
}

export function generateBookingId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function isSlotBooked(
  email: string,
  consultantId: string,
  date: string,
  timeSlot: string
): boolean {
  return getBookings(email).some(
    (b) =>
      b.consultantId === consultantId &&
      b.date === date &&
      b.timeSlot === timeSlot &&
      b.status === "confirmed"
  )
}
