"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Plus, Star, Monitor, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import Image from "next/image"
import { ConsultantMeta } from "@/lib/consultants-server"

const EMPTY: Omit<ConsultantMeta, "id"> = {
  name: "",
  specialty: "",
  bio: "",
  avatarUrl: "",
  hourlyRate: 100,
  rating: 5.0,
  reviewCount: 0,
  tags: [],
  offersOnline: true,
  offersInPerson: false,
}

export default function AdminConsultantsPage() {
  const [consultants, setConsultants] = useState<ConsultantMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ConsultantMeta | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [tagsInput, setTagsInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/consultants")
      .then((r) => r.json())
      .then((data) => { setConsultants(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY)
    setTagsInput("")
    setDialogOpen(true)
  }

  function openEdit(c: ConsultantMeta) {
    setEditing(c)
    setForm({ name: c.name, specialty: c.specialty, bio: c.bio, avatarUrl: c.avatarUrl, hourlyRate: c.hourlyRate, rating: c.rating, reviewCount: c.reviewCount, tags: c.tags, offersOnline: c.offersOnline ?? true, offersInPerson: c.offersInPerson ?? false })
    setTagsInput(c.tags.join(", "))
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.specialty.trim() || !form.bio.trim()) {
      toast.error("Name, specialty, and bio are required.")
      return
    }

    setSaving(true)
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
    const body = { ...form, tags }

    try {
      const res = editing
        ? await fetch(`/api/admin/consultants/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/admin/consultants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editing) {
        setConsultants((prev) => prev.map((c) => c.id === editing.id ? data : c))
        toast.success("Consultant updated.")
      } else {
        setConsultants((prev) => [...prev, data])
        toast.success("Consultant added.")
      }
      setDialogOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/consultants/${id}`, { method: "DELETE" })
    if (res.ok) {
      setConsultants((prev) => prev.filter((c) => c.id !== id))
      toast.success("Consultant deleted.")
    } else {
      toast.error("Failed to delete.")
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultants</h1>
          <p className="text-gray-500 mt-1">
            {loading ? "Loading…" : `${consultants.length} consultant${consultants.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={openAdd} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Consultant
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : consultants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">No consultants yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Consultant", "Specialty", "Rate", "Rating", "Format", "Tags", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {consultants.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Image src={c.avatarUrl} alt={c.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{c.specialty}</td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">${c.hourlyRate}/hr</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {c.rating.toFixed(1)}
                        <span className="text-gray-400 font-normal">({c.reviewCount})</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        {c.offersOnline && <span className="inline-flex items-center gap-0.5 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"><Monitor className="h-3 w-3" /> Online</span>}
                        {c.offersInPerson && <span className="inline-flex items-center gap-0.5 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full"><MapPin className="h-3 w-3" /> In-Person</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                        {c.tags.length > 3 && <span className="text-xs text-gray-400">+{c.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-teal-600 transition-colors p-1 rounded">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(c.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Consultant" : "Add Consultant"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Name <span className="text-red-400">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Specialty <span className="text-red-400">*</span></Label>
                <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Career Coaching" />
              </div>
              <div className="space-y-1.5">
                <Label>Hourly Rate ($)</Label>
                <Input type="number" value={form.hourlyRate} min={1} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Bio <span className="text-red-400">*</span></Label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Professional background and expertise…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Avatar URL</Label>
              <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://…" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Rating (0–5)</Label>
                <Input type="number" value={form.rating} min={0} max={5} step={0.1} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Review Count</Label>
                <Input type="number" value={form.reviewCount} min={0} onChange={(e) => setForm({ ...form, reviewCount: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tags <span className="text-gray-400 font-normal">(comma-separated)</span></Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Leadership, Strategy, Startups" />
            </div>

            <div className="space-y-2">
              <Label>Session Formats</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.offersOnline} onChange={(e) => setForm({ ...form, offersOnline: e.target.checked })} className="accent-teal-600" />
                  <Monitor className="h-4 w-4 text-blue-500" /> Online
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.offersInPerson} onChange={(e) => setForm({ ...form, offersInPerson: e.target.checked })} className="accent-teal-600" />
                  <MapPin className="h-4 w-4 text-orange-500" /> In-Person
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : (editing ? "Save Changes" : "Add Consultant")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Consultant</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to delete this consultant? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
