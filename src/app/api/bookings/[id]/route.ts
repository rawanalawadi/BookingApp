import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  cancelBookingServer,
  getBookingById,
  modifyBookingServer,
  updateBookingStatus,
} from "@/lib/bookings-server"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const booking = await getBookingById(params.id)
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(booking)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const booking = await getBookingById(params.id)
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))

  // Phone-verified cancellation — no auth needed
  if (body.action === "cancel" && body.phone) {
    if (booking.customerPhone !== body.phone) {
      return NextResponse.json({ error: "Phone number does not match this booking" }, { status: 403 })
    }
    await cancelBookingServer(params.id)
    return NextResponse.json({ ok: true })
  }

  // Phone-verified modification — no auth needed
  if (body.action === "modify" && body.phone) {
    if (booking.customerPhone !== body.phone) {
      return NextResponse.json({ error: "Phone number does not match this booking" }, { status: 403 })
    }
    const { date, timeSlot, sessionType, notes } = body
    if (!date || !timeSlot || !sessionType) {
      return NextResponse.json({ error: "date, timeSlot and sessionType are required" }, { status: 400 })
    }
    const updated = await modifyBookingServer(params.id, { date, timeSlot, sessionType, notes })
    return NextResponse.json({ ok: true, booking: updated })
  }

  // Admin / auth-based operations
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (body.action === "cancel") {
    await cancelBookingServer(params.id)
    return NextResponse.json({ ok: true })
  }

  if (body.status && session.user.isAdmin) {
    const updated = await updateBookingStatus(params.id, body.status, body.paymentReference)
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 })
}
