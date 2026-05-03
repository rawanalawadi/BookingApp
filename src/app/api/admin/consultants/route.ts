import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getConsultantMetas, saveConsultantMetas, ConsultantMeta } from "@/lib/consultants-server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return NextResponse.json(getConsultantMetas())
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const metas = getConsultantMetas()

    const slug = (body.name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const existing = metas.find((m) => m.id === slug)
    const id = existing ? `${slug}-${Date.now()}` : slug

    const newConsultant: ConsultantMeta = {
      id,
      name: body.name,
      specialty: body.specialty,
      bio: body.bio,
      avatarUrl: body.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=0d9488&color=fff&size=200`,
      hourlyRate: Number(body.hourlyRate),
      rating: Number(body.rating) || 5.0,
      reviewCount: Number(body.reviewCount) || 0,
      tags: Array.isArray(body.tags)
        ? body.tags
        : String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean),
      offersOnline: body.offersOnline ?? true,
      offersInPerson: body.offersInPerson ?? false,
    }

    metas.push(newConsultant)
    saveConsultantMetas(metas)
    return NextResponse.json(newConsultant, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
