import Link from "next/link"
import { CalendarCheck, Mail, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <CalendarCheck className="h-5 w-5 text-rose-400" />
              ConsultEase
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connect with top-tier consultants across career, finance, wellness, legal, and business strategy — all on your schedule.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/consultants", label: "Browse Consultants" },
                { href: "/my-bookings", label: "My Bookings" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-rose-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-400" />
                hello@consultease.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-rose-400" />
                +1 (800) 555-0199
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ConsultEase. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
