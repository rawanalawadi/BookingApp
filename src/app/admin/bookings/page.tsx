"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Booking } from "@/lib/types"

const STATUS_META: Record<string, { label: string; class: string }> = {
  pending:   { label: "Pending",   class: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", class: "bg-rose-100 text-rose-600"   },
  completed: { label: "Completed", class: "bg-blue-100 text-blue-700"   },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700"     },
}

function fmt(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [status, setStatus]     = useState("all")
  const [date, setDate]         = useState("")
  const [search, setSearch]     = useState("")

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = bookings
    .filter((b) => {
      if (status !== "all" && b.status !== status) return false
      if (date && b.date !== date) return false
      if (search) {
        const q = search.toLowerCase()
        if (!b.consultantName.toLowerCase().includes(q) && !b.consultantSpecialty.toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date)
      return dateDiff !== 0 ? dateDiff : a.timeSlot.localeCompare(b.timeSlot)
    })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1">
          {loading ? "Loading…" : `${bookings.length} total · ${filtered.length} shown`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search consultant or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-56"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(date || status !== "all" || search) && (
          <button
            onClick={() => { setDate(""); setStatus("all"); setSearch("") }}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">No bookings match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Consultant", "Customer", "Date", "Time", "Session", "Status", ""].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => {
                  const s = STATUS_META[b.status] ?? { label: b.status, class: "bg-gray-100 text-gray-600" }
                  return (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/admin/bookings/${b.id}`)}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 whitespace-nowrap">{b.consultantName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{b.consultantSpecialty}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {"customerName" in b && b.customerName ? b.customerName : b.userEmail ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{fmt(b.date)}</td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">{b.timeSlot}</td>
                      <td className="px-5 py-3.5 text-gray-500 capitalize whitespace-nowrap">{b.sessionType?.replace("_", " ")}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.class}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">View →</td>
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
