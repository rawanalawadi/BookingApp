import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    const sb = createServerClient()

    // Check for existing user
    const { data: existing } = await sb
      .from("app_users")
      .select("email")
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const { error } = await sb.from("app_users").insert({
      email,
      name,
      password: passwordHash,
      is_admin: false,
    })

    if (error) throw error
    return NextResponse.json({ message: "Account created successfully." }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
