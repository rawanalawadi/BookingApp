import { NextResponse } from "next/server"
import { writeFileSync } from "fs"
import path from "path"
import { auth } from "@/auth"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, or GIF images are allowed" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 })
    }

    const ext = file.type.split("/")[1].replace("jpeg", "jpg")
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = path.join(process.cwd(), "public", "uploads", "avatars", filename)

    const bytes = await file.arrayBuffer()
    writeFileSync(filePath, Buffer.from(bytes))

    return NextResponse.json({ url: `/uploads/avatars/${filename}` })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
