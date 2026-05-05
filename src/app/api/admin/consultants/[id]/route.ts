import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getConsultantMetaById, saveConsultantMeta, deleteConsultantMeta } from "@/lib/consultants-server"

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
    const existing = await getConsultantMetaById(params.id)
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = {
      ...existing,
      name:           body.name            ?? existing.name,
      specialty:      body.specialty       ?? existing.specialty,
      bio:            body.bio             ?? existing.bio,
      avatarUrl:      body.avatarUrl       ?? existing.avatarUrl,
      hourlyRate:     body.hourlyRate != null ? Number(body.hourlyRate) : existing.hourlyRate,
      rating:         body.rating     != null ? Number(body.rating)     : existing.rating,
      reviewCount:    body.reviewCount != null ? Number(body.reviewCount) : existing.reviewCount,
      tags:           body.tags != null
        ? (Array.isArray(body.tags) ? body.tags : String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean))
        : existing.tags,
      offersOnline:   body.offersOnline   ?? existing.offersOnline,
      offersInPerson: body.offersInPerson ?? existing.offersInPerson,
      schedule:       body.schedule !== undefined ? body.schedule : existing.schedule,
    }

    await saveConsultantMeta(updated)
    return NextResponse.json(updated)
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

  const existing = await getConsultantMetaById(params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await deleteConsultantMeta(params.id)
  return NextResponse.json({ ok: true })
}
