"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { CalendarCheck, Menu, X, LogOut, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/consultants", label: "Consultants" },
  { href: "/my-bookings", label: "My Bookings" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U"

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-teal-700">
            <CalendarCheck className="h-6 w-6" />
            ConsultEase
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:text-teal-700 hover:bg-teal-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Avatar className="h-8 w-8 bg-teal-100">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{session.user?.name?.split(" ")[0]}</span>
                </div>
                {session.user?.isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-600 hover:text-teal-700 hover:bg-teal-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            {session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-teal-600" />
                  {session.user?.name}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
