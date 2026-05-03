import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { readFileSync } from "fs"
import path from "path"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const raw = readFileSync(path.join(process.cwd(), "src/lib/users.json"), "utf-8")
    const users = JSON.parse(raw)
    const safe = users.map(({ id, name, email }: { id: string; name: string; email: string }) => ({ id, name, email }))
    return NextResponse.json(safe)
  } catch {
    return NextResponse.json([])
  }
}
