export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get("phone")?.trim()

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const sb = createServerClient()

  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("customer_phone", phone)
    .neq("status", "cancelled")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time_slot", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
