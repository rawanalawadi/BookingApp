import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getSlotsForDate, toggleSlot } from "@/lib/consultants-server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const consultantId = searchParams.get("consultantId")
  const date = searchParams.get("date")
  if (!consultantId || !date) return NextResponse.json({ error: "Missing params" }, { status: 400 })

  const slots = getSlotsForDate(consultantId, date)
  if (slots === null) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(slots)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { consultantId, date, time } = await req.json()
    if (!consultantId || !date || !time) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const result = toggleSlot(consultantId, date, time)
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
