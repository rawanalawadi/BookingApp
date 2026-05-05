"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"
import BookingChatWidget from "@/components/chat/BookingChatWidget"

const HIDE_CHAT_ON = ["/payment", "/booking/confirmation", "/manage", "/auth", "/admin"]

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const showChat = !HIDE_CHAT_ON.some((p) => pathname?.startsWith(p))

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {showChat && <BookingChatWidget />}
    </>
  )
}
