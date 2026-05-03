import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { cancelBookingServer, getBookingById, updateBookingStatus } from "@/lib/bookings-server"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const booking = getBookingById(params.id)
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(booking)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const booking = getBookingById(params.id)
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))

  if (body.action === "cancel") {
    cancelBookingServer(params.id)
    return NextResponse.json({ ok: true })
  }

  if (body.status && session.user.isAdmin) {
    const updated = updateBookingStatus(params.id, body.status, body.paymentReference)
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 })
}
