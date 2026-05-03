"use client"

import { useState, useEffect } from "react"
import { Booking } from "@/lib/types"

const STATUS_META: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", class: "bg-teal-100 text-teal-700" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700" },
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || b.consultantName.toLowerCase().includes(q) || b.consultantSpecialty.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1">{loading ? "Loading…" : `${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}`}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by consultant or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Consultant", "Specialty", "Date", "Time", "Session", "Rate", "Status", "Booked"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => {
                  const s = STATUS_META[b.status] ?? { label: b.status, class: "bg-gray-100 text-gray-600" }
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{b.consultantName}</td>
                      <td className="px-5 py-3.5 text-gray-500">{b.consultantSpecialty}</td>
                      <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{formatDate(b.date)}</td>
                      <td className="px-5 py-3.5 text-gray-700">{b.timeSlot}</td>
                      <td className="px-5 py-3.5 text-gray-500 capitalize">{b.sessionType?.replace("_", " ")}</td>
                      <td className="px-5 py-3.5 text-gray-700">${b.hourlyRate}/hr</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.class}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(b.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
