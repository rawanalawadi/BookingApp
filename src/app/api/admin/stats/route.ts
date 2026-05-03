import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAllBookings } from "@/lib/bookings-server"
import { getConsultantMetas } from "@/lib/consultants-server"
import { readFileSync } from "fs"
import path from "path"

function getUserCount(): number {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src/lib/users.json"), "utf-8")
    return JSON.parse(raw).length
  } catch {
    return 0
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const bookings = getAllBookings()
  const consultants = getConsultantMetas()
  const users = getUserCount()

  const revenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.hourlyRate, 0)

  const byStatus = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    users,
    consultants: consultants.length,
    bookings: bookings.length,
    revenue,
    byStatus,
  })
}
