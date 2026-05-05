"use client"

import { useState } from "react"
import { Sparkles, X } from "lucide-react"
import BookingChat from "./BookingChat"

export default function BookingChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold text-sm transition-all bg-teal-600 text-white hover:bg-teal-700 hover:scale-105"
        aria-label="AI booking assistant"
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {open ? "Close" : "Book with AI"}
      </button>

      {/* Sliding panel */}
      <div
        className={`fixed bottom-20 right-6 z-50 w-[370px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-200 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ height: "min(560px, calc(100vh - 100px))" }}
      >
        <BookingChat />
      </div>
    </>
  )
}
