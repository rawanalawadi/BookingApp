import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAllBookings } from "@/lib/bookings-server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return NextResponse.json(getAllBookings())
}
