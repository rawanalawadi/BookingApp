"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { CalendarCheck, Menu, X, LogOut, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { CURRENCIES } from "@/lib/currency"
import { useCurrency } from "@/contexts/CurrencyContext"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/consultants", label: "Our Experts" },
  { href: "/manage", label: "Manage Booking" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currency, setCurrencyCode } = useCurrency()

  const initials = session?.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U"

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-rose-600">
            <CalendarCheck className="h-6 w-6" />
            ConsultEase
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", pathname === link.href ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:text-rose-600 hover:bg-rose-50")}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <select
              value={currency.code}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="h-8 px-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-rose-100 text-rose-600 text-xs font-semibold">{initials}</AvatarFallback></Avatar>
                  <span className="font-medium">{session.user?.name?.split(" ")[0]}</span>
                </div>
                {session.user?.isAdmin && (
                  <Link href="/admin"><Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-1"><ShieldCheck className="h-4 w-4" />Admin</Button></Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-1" />Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/consultants">
                <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5">
                  Book Now
                </Button>
              </Link>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn("block px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === link.href ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:text-rose-600 hover:bg-rose-50")}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2 space-y-2">
            {/* Currency selector */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Currency</p>
              <select
                value={currency.code}
                onChange={(e) => { setCurrencyCode(e.target.value); setMobileOpen(false) }}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            {session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700"><User className="h-4 w-4 text-rose-500" />{session.user?.name}</div>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </div>
            ) : (
              <Link href="/consultants" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold">
                  Book Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
