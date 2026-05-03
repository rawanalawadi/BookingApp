import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { addBookingServer, getBookingsByUser } from "@/lib/bookings-server"
import { Booking } from "@/lib/types"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const bookings = getBookingsByUser(session.user.email)
  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const {
      consultantId, consultantName, consultantSpecialty, consultantAvatarUrl,
      date, timeSlot, sessionType, summary, hourlyRate,
    } = body

    if (!consultantId || !date || !timeSlot || !sessionType || !summary || !hourlyRate) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }
    if (summary.trim().length < 20) {
      return NextResponse.json({ error: "Summary must be at least 20 characters." }, { status: 400 })
    }

    const booking = {
      id: crypto.randomUUID(),
      userEmail: session.user.email,
      consultantId,
      consultantName,
      consultantSpecialty,
      consultantAvatarUrl,
      date,
      timeSlot,
      sessionType,
      summary: summary.trim(),
      status: "pending" as Booking["status"],
      createdAt: new Date().toISOString(),
      hourlyRate,
    }

    addBookingServer(booking as Booking)
    return NextResponse.json({ booking }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
