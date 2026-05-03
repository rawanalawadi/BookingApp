import { getAllBookings } from "@/lib/bookings-server"
import { getConsultantMetas } from "@/lib/consultants-server"
import { readFileSync } from "fs"
import path from "path"
import { Users, UserSquare2, BookOpen, DollarSign, TrendingUp, Clock, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function getUserCount(): number {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src/lib/users.json"), "utf-8")
    return JSON.parse(raw).length
  } catch {
    return 0
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const STATUS_META: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", class: "bg-teal-100 text-teal-700" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700" },
}

export default function AdminDashboard() {
  const bookings = getAllBookings()
  const consultants = getConsultantMetas()
  const userCount = getUserCount()

  const revenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.hourlyRate, 0)

  const confirmed = bookings.filter((b) => b.status === "confirmed").length
  const pending = bookings.filter((b) => b.status === "pending").length
  const cancelled = bookings.filter((b) => b.status === "cancelled").length

  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const stats = [
    { title: "Total Users", value: userCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Consultants", value: consultants.length, icon: UserSquare2, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Total Bookings", value: bookings.length, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Revenue", value: formatCurrency(revenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`${bg} p-3 rounded-xl`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking status summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-teal-50 p-3 rounded-xl"><TrendingUp className="h-5 w-5 text-teal-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-xl font-bold text-gray-900">{confirmed}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-xl"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-xl"><XCircle className="h-5 w-5 text-red-500" /></div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">{cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 px-6 py-10 text-center">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Consultant", "Date", "Time", "Session", "Rate", "Status"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b, i) => {
                    const s = STATUS_META[b.status] ?? { label: b.status, class: "bg-gray-100 text-gray-600" }
                    return (
                      <tr key={b.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-6 py-3 font-medium text-gray-900">{b.consultantName}</td>
                        <td className="px-6 py-3 text-gray-600">{formatDate(b.date)}</td>
                        <td className="px-6 py-3 text-gray-600">{b.timeSlot}</td>
                        <td className="px-6 py-3 text-gray-500 capitalize">{b.sessionType?.replace("_", " ")}</td>
                        <td className="px-6 py-3 text-gray-700">${b.hourlyRate}/hr</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.class}`}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
