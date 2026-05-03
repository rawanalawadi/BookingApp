import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { Booking } from "./types"

function getFilePath(): string {
  return path.join(process.cwd(), "src/lib/bookings.json")
}

export function getAllBookings(): Booking[] {
  try {
    const raw = readFileSync(getFilePath(), "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function getBookingsByUser(email: string): Booking[] {
  return getAllBookings().filter((b) => b.userEmail === email)
}

export function saveAllBookings(bookings: Booking[]): void {
  writeFileSync(getFilePath(), JSON.stringify(bookings, null, 2))
}

export function addBookingServer(booking: Booking): void {
  const bookings = getAllBookings()
  bookings.push(booking)
  saveAllBookings(bookings)
}

export function getBookingById(id: string): Booking | undefined {
  return getAllBookings().find((b) => b.id === id)
}

export function updateBookingStatus(
  id: string,
  status: Booking["status"],
  paymentReference?: string
): Booking | null {
  const bookings = getAllBookings()
  const idx = bookings.findIndex((b) => b.id === id)
  if (idx === -1) return null
  bookings[idx] = {
    ...bookings[idx],
    status,
    ...(paymentReference ? { paymentReference } : {}),
  }
  saveAllBookings(bookings)
  return bookings[idx]
}

export function cancelBookingServer(id: string): boolean {
  const bookings = getAllBookings()
  const idx = bookings.findIndex((b) => b.id === id)
  if (idx === -1) return false
  bookings[idx] = { ...bookings[idx], status: "cancelled" }
  saveAllBookings(bookings)
  return true
}
