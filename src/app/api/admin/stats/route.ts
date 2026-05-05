export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAllBookings } from "@/lib/bookings-server"
import { getConsultantMetas } from "@/lib/consultants-server"
import { createServerClient } from "@/lib/supabase"

async function getUserCount(): Promise<number> {
  const sb = createServerClient()
  const { count } = await sb
    .from("app_users")
    .select("email", { count: "exact", head: true })
  return count ?? 0
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [bookings, consultants, users] = await Promise.all([
    getAllBookings(),
    getConsultantMetas(),
    getUserCount(),
  ])

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
