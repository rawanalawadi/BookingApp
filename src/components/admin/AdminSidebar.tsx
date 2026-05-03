"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  CalendarCheck,
  LayoutDashboard,
  Users,
  BookOpen,
  UserSquare2,
  LogOut,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/consultants", label: "Consultants", icon: UserSquare2 },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "A"

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-500 p-1.5 rounded-lg">
            <CalendarCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">ConsultEase</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-teal-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="h-8 w-8 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name ?? "Admin"}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
