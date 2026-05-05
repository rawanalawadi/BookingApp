"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

function renderContent(text: string) {
  // Convert **bold** and [link](url) to JSX-safe HTML string
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    if (match[1] !== undefined) {
      // Bold
      parts.push(<strong key={match.index}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      // Link
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          className="font-semibold text-rose-500 underline underline-offset-2 hover:text-rose-600"
        >
          {match[2]}
        </a>
      )
    }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hi! I'm here to help you find the right expert. What do you need help with today?",
}

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg: Message = { role: "user", content: text }
    const history = [...messages, userMsg].filter((m) => m !== WELCOME)
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setStreaming(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      })

      if (res.status === 503) {
        setUnavailable(true)
        setStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content: accumulated }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ])
    }

    setStreaming(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold text-sm transition-all",
          open
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-rose-500 text-white hover:bg-rose-600 hover:scale-105"
        )}
      >
        {open ? (
          <><X className="h-4 w-4" /> Close</>
        ) : (
          <><MessageCircle className="h-4 w-4" /> Ask AI</>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: "min(480px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-full">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Booking Assistant</p>
              <p className="text-rose-100 text-xs">AI-powered · Instant replies</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {unavailable ? (
              <div className="text-center text-sm text-gray-400 py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
                AI assistant not configured yet.
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-rose-500" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-rose-500 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    )}
                  >
                    {msg.content === "" && streaming ? (
                      <span className="flex gap-1 items-center py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                      </span>
                    ) : (
                      renderContent(msg.content)
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!unavailable && (
            <div className="border-t border-gray-100 px-3 py-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Describe what you need help with…"
                disabled={streaming}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={streaming || !input.trim()}
                className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40 transition-colors shrink-0"
              >
                {streaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
