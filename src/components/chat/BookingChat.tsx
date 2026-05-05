"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, Loader2, CalendarCheck, Sparkles, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingCard {
  id:              string
  consultantName:  string
  consultantAvatar: string
  date:            string
  timeSlot:        string
  sessionType:     "online" | "in_person"
  hourlyRate:      number
}

interface Message {
  id:      string
  role:    "user" | "assistant"
  content: string       // displayed text (marker stripped)
  booking?: BookingCard // extracted from marker if present
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BOOKING_MARKER_RE = /<!--BOOKING:(\{[\s\S]*?\})-->/

function parseMessage(raw: string): { text: string; booking?: BookingCard } {
  const match = raw.match(BOOKING_MARKER_RE)
  if (!match) return { text: raw }
  const booking: BookingCard = JSON.parse(match[1])
  return { text: raw.replace(BOOKING_MARKER_RE, "").trim(), booking }
}

/** Render markdown-lite: **bold**, bullet lists, line breaks */
function renderContent(text: string) {
  const lines = text.split("\n")
  return lines.map((line, i) => {
    // bold
    const parts = line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={j}>{part.slice(2, -2)}</strong>
        : <span key={j}>{part}</span>
    )
    const isBullet = line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")
    return isBullet
      ? <li key={i} className="ml-4 list-disc">{parts}</li>
      : <p key={i} className={cn("leading-relaxed", line === "" && "h-2")}>{parts}</p>
  })
}

// ─── Booking confirmation card ────────────────────────────────────────────────

function BookingConfirmationCard({ booking }: { booking: BookingCard }) {
  const dateLabel = format(parseISO(booking.date), "EEEE, MMMM d, yyyy")
  const timeLabel = (() => {
    try {
      const [h, m] = booking.timeSlot.split(":").map(Number)
      const d = new Date(); d.setHours(h, m)
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    } catch { return booking.timeSlot }
  })()

  return (
    <div className="mt-3 rounded-2xl border border-teal-200 bg-teal-50 overflow-hidden">
      <div className="bg-teal-600 px-4 py-3 flex items-center gap-2">
        <CalendarCheck className="h-4 w-4 text-white" />
        <span className="text-sm font-semibold text-white">Booking Confirmed!</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={booking.consultantAvatar} alt={booking.consultantName}
            className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{booking.consultantName}</p>
            <p className="text-xs text-gray-500">
              {booking.sessionType === "online" ? "🖥 Online Session" : "📍 In-Person Session"}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-teal-100">
          <p>📅 {dateLabel}</p>
          <p>🕐 {timeLabel}</p>
          <p>💰 KWD {booking.hourlyRate}/hr</p>
        </div>
        <p className="text-xs text-teal-600 font-mono pt-1">Ref: {booking.id.slice(0, 12).toUpperCase()}</p>
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  return (
    <div className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-rose-500" : "bg-teal-600"
      )}>
        {isUser
          ? <User className="h-4 w-4 text-white" />
          : <Bot  className="h-4 w-4 text-white" />}
      </div>

      {/* Bubble */}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
        isUser
          ? "bg-rose-500 text-white rounded-br-sm"
          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
      )}>
        <div className="space-y-0.5">{renderContent(msg.content)}</div>
        {msg.booking && <BookingConfirmationCard booking={msg.booking} />}
      </div>
    </div>
  )
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED = [
  "I need a financial advisor 💰",
  "Help with career coaching 🚀",
  "Looking for mental wellness support 🧘",
  "Legal consultation needed ⚖️",
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookingChat() {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    setLoading(true)

    // Build Anthropic-format history for the API
    const apiMessages = history.map((m) => ({
      role:    m.role,
      content: m.content,
    }))

    try {
      const res = await fetch("/api/chat-book", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok || !res.body) throw new Error("Request failed")

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   raw     = ""

      const assistantId  = crypto.randomUUID()
      // Add placeholder message so we can update it in-place
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })

        // Update displayed text (strip marker while streaming)
        const { text } = parseMessage(raw)
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: text } : m)
        )
      }

      // Final parse — extract booking card if present
      const { text, booking } = parseMessage(raw)
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: text, booking } : m)
      )
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, loading])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function reset() {
    setMessages([])
    setInput("")
    inputRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">AI Booking Assistant</p>
            <p className="text-xs text-teal-600">Powered by RAG · Always available</p>
          </div>
        </div>
        {!isEmpty && (
          <button onClick={reset} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Start over">
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="space-y-2">
              <div className="h-16 w-16 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Book a Session</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Tell me what you need help with and I&apos;ll find the right expert and book a session for you — all in this chat.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you need help with…"
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none leading-relaxed py-1 max-h-32 disabled:opacity-60"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = Math.min(el.scrollHeight, 128) + "px"
            }}
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="h-8 w-8 p-0 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 flex-shrink-0"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send    className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
