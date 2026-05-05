import { NextResponse } from "next/server"
import { getAllBookings } from "@/lib/bookings-server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get("phone")?.trim()

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)

  const bookings = getAllBookings().filter(
    (b) =>
      b.customerPhone === phone &&
      b.status !== "cancelled" &&
      b.date >= today
  )

  // Sort ascending by date then time
  bookings.sort((a, b) =>
    a.date !== b.date ? a.date.localeCompare(b.date) : a.timeSlot.localeCompare(b.timeSlot)
  )

  return NextResponse.json(bookings)
}
