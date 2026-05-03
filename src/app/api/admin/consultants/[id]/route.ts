import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getConsultantMetas, saveConsultantMetas } from "@/lib/consultants-server"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const metas = getConsultantMetas()
    const idx = metas.findIndex((m) => m.id === params.id)
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })

    metas[idx] = {
      ...metas[idx],
      name: body.name ?? metas[idx].name,
      specialty: body.specialty ?? metas[idx].specialty,
      bio: body.bio ?? metas[idx].bio,
      avatarUrl: body.avatarUrl ?? metas[idx].avatarUrl,
      hourlyRate: body.hourlyRate != null ? Number(body.hourlyRate) : metas[idx].hourlyRate,
      rating: body.rating != null ? Number(body.rating) : metas[idx].rating,
      reviewCount: body.reviewCount != null ? Number(body.reviewCount) : metas[idx].reviewCount,
      tags: body.tags != null
        ? (Array.isArray(body.tags) ? body.tags : String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean))
        : metas[idx].tags,
      offersOnline: body.offersOnline ?? metas[idx].offersOnline,
      offersInPerson: body.offersInPerson ?? metas[idx].offersInPerson,
    }

    saveConsultantMetas(metas)
    return NextResponse.json(metas[idx])
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const metas = getConsultantMetas()
  const filtered = metas.filter((m) => m.id !== params.id)
  if (filtered.length === metas.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  saveConsultantMetas(filtered)
  return NextResponse.json({ ok: true })
}
