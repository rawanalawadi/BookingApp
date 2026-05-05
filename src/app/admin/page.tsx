export const dynamic = "force-dynamic"

import { getAllBookings } from "@/lib/bookings-server"
import { getConsultantMetas } from "@/lib/consultants-server"
import { createServerClient } from "@/lib/supabase"
import { format } from "date-fns"
import Link from "next/link"
import { Users, UserSquare2, BookOpen, DollarSign, Monitor, MapPin, Clock } from "lucide-react"

async function getUserCount(): Promise<number> {
  const sb = createServerClient()
  const { count } = await sb
    .from("app_users")
    .select("email", { count: "exact", head: true })
  return count ?? 0
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-400", text: "text-amber-700" },
  confirmed: { label: "Confirmed", dot: "bg-rose-500",  text: "text-rose-600"  },
  completed: { label: "Completed", dot: "bg-blue-500",  text: "text-blue-700"  },
  cancelled: { label: "Cancelled", dot: "bg-red-400",   text: "text-red-700"   },
}

export default async function AdminDashboard() {
  const [bookings, consultants, userCount] = await Promise.all([
    getAllBookings(),
    getConsultantMetas(),
    getUserCount(),
  ])

  const todayStr = format(new Date(), "yyyy-MM-dd")
  const todayBookings = bookings
    .filter((b) => b.date === todayStr && b.status !== "cancelled")
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))

  const revenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.hourlyRate, 0)

  const stats = [
    { label: "Users",       value: userCount,              icon: Users,       color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Consultants", value: consultants.length,     icon: UserSquare2, color: "text-rose-500",   bg: "bg-rose-50"   },
    { label: "Bookings",    value: bookings.length,        icon: BookOpen,    color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Revenue",     value: formatCurrency(revenue),icon: DollarSign,  color: "text-orange-500", bg: "bg-orange-50" },
  ]

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium mb-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-lg flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Today&apos;s Schedule
            {todayBookings.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                {todayBookings.length} booking{todayBookings.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <Link href="/admin/bookings" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
            All bookings →
          </Link>
        </div>

        {todayBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-14 text-center">
            <Clock className="h-8 w-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No bookings scheduled for today</p>
            <p className="text-xs text-gray-400 mt-1">New bookings will appear here once confirmed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((b) => {
              const s = STATUS_META[b.status] ?? { label: b.status, dot: "bg-gray-400", text: "text-gray-600" }
              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-5 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 hover:border-rose-200 hover:shadow-md transition-all group"
                >
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900 leading-none">{b.timeSlot}</p>
                  </div>

                  <div className="w-px h-10 bg-gray-100 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{b.consultantName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {b.consultantSpecialty}
                      {"customerName" in b && b.customerName ? ` · ${b.customerName}` : ""}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {b.sessionType === "online" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Monitor className="h-3 w-3" /> Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        <MapPin className="h-3 w-3" /> In-Person
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
