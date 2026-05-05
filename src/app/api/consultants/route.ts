import { NextResponse } from "next/server"
import { getAllConsultantsWithSchedules } from "@/lib/consultants-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const consultants = await getAllConsultantsWithSchedules()
  return NextResponse.json(consultants)
}
