export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const sb = createServerClient()
  const { data, error } = await sb
    .from("app_users")
    .select("email, name")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}
