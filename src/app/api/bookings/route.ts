export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { addBookingServer, getBookingsByUser } from "@/lib/bookings-server"
import { Booking } from "@/lib/types"
import { normalizePhone } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const bookings = await getBookingsByUser(session.user.email)
  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      customerName, customerPhone,
      consultantId, consultantName, consultantSpecialty, consultantAvatarUrl,
      date, timeSlot, sessionType, notes, hourlyRate,
    } = body

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json({ error: "Name and phone number are required." }, { status: 400 })
    }
    if (!consultantId || !date || !timeSlot || !sessionType || !hourlyRate) {
      return NextResponse.json({ error: "Missing required booking fields." }, { status: 400 })
    }

    const session = await auth()

    const booking: Booking = {
      id:                    crypto.randomUUID(),
      userEmail:             session?.user?.email ?? undefined,
      customerName:          customerName.trim(),
      customerPhone:         normalizePhone(customerPhone),
      consultantId,
      consultantName,
      consultantSpecialty,
      consultantAvatarUrl,
      date,
      timeSlot,
      sessionType,
      notes:                 notes?.trim() || undefined,
      status:                "pending",
      createdAt:             new Date().toISOString(),
      hourlyRate,
    }

    const saved = await addBookingServer(booking)
    return NextResponse.json({ booking: saved }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
