export const dynamic = "force-dynamic"

/**
 * RAG-powered booking chatbot — OpenRouter / OpenAI-compatible implementation.
 *
 * Flow:
 *   1. Client sends conversation history (OpenAI ChatCompletionMessageParam[])
 *   2. Server runs agentic loop: LLM ↔ tools until finish_reason === "stop"
 *   3. Text tokens stream back to the client
 *   4. When a booking is created the stream ends with:
 *        \n\n<!--BOOKING:{...}-->
 */

import type { ChatCompletionMessageParam, ChatCompletionTool, ChatCompletionMessageToolCall } from "openai/resources/chat"
import { getOpenRouterClient, isOpenRouterConfigured, OR_MODEL } from "@/lib/ai-client"
import { getAllConsultantsWithSchedules }                         from "@/lib/consultants-server"
import { searchConsultants }                                      from "@/lib/vector-store"
import { createOTP, verifyOTP }                                   from "@/lib/otp"
import { addBookingServer }                                       from "@/lib/bookings-server"
import type { Booking }                                           from "@/lib/types"
import { format, addDays }                                        from "date-fns"

// ─── Tool definitions (OpenAI format) ─────────────────────────────────────────

const TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name:        "search_consultants",
      description: "Search for consultants that match the user's needs using semantic RAG retrieval. Returns the top matches with full profile details.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Natural-language description of what the user needs (e.g. 'financial advisor for retirement planning')" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name:        "get_slots",
      description: "Get available booking slots for a specific consultant over the next 14 days.",
      parameters: {
        type: "object",
        properties: {
          consultant_id: { type: "string", description: "The consultant's ID" },
        },
        required: ["consultant_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name:        "send_otp",
      description: "Send a one-time verification code to a phone number. Must be called before create_booking.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Phone number with country code, e.g. +96512345678" },
        },
        required: ["phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name:        "create_booking",
      description: "Verify the OTP code and create a confirmed booking. Only call after send_otp and the user has provided their code.",
      parameters: {
        type: "object",
        properties: {
          consultant_id:  { type: "string"  },
          customer_name:  { type: "string"  },
          customer_phone: { type: "string"  },
          otp_code:       { type: "string", description: "6-digit OTP entered by the user" },
          date:           { type: "string", description: "Booking date YYYY-MM-DD" },
          time_slot:      { type: "string", description: "Time HH:MM (24-hour)" },
          session_type:   { type: "string", enum: ["online", "in_person"] },
          notes:          { type: "string" },
        },
        required: ["consultant_id", "customer_name", "customer_phone", "otp_code", "date", "time_slot", "session_type"],
      },
    },
  },
]

// ─── Twilio helper ─────────────────────────────────────────────────────────────

function isTwilioConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID
  return !(!sid || sid === "your-twilio-account-sid")
}

// ─── Tool executor ─────────────────────────────────────────────────────────────

type ToolArgs = Record<string, string>

async function executeTool(
  name: string,
  args: ToolArgs,
): Promise<{ result: unknown; bookingCreated?: Booking }> {

  if (name === "search_consultants") {
    const consultants = await getAllConsultantsWithSchedules()
    const results     = await searchConsultants(args.query, consultants, 3)
    return {
      result: results.map(({ consultant: c, score }) => ({
        id:             c.id,
        name:           c.name,
        specialty:      c.specialty,
        bio:            c.bio,
        tags:           c.tags,
        hourlyRate:     c.hourlyRate,
        rating:         c.rating,
        reviewCount:    c.reviewCount,
        offersOnline:   c.offersOnline,
        offersInPerson: c.offersInPerson,
        relevanceScore: Math.round(score * 100) / 100,
      })),
    }
  }

  if (name === "get_slots") {
    const consultants = await getAllConsultantsWithSchedules()
    const c = consultants.find((x) => x.id === args.consultant_id)
    if (!c) return { result: { error: "Consultant not found" } }

    const today  = new Date()
    const window: { date: string; day: string; slots: string[] }[] = []
    for (let i = 1; i <= 14; i++) {
      const date    = addDays(today, i)
      const dateStr = format(date, "yyyy-MM-dd")
      const dayName = format(date, "EEEE, MMM d")
      const slots   = (c.availableSlots[dateStr] ?? []).filter((s) => s.available).map((s) => s.time)
      if (slots.length > 0) window.push({ date: dateStr, day: dayName, slots })
    }
    return { result: { consultantName: c.name, availability: window } }
  }

  if (name === "send_otp") {
    const code = createOTP(args.phone)
    let sandboxCode: string | undefined

    if (isTwilioConfigured()) {
      try {
        const twilio = (await import("twilio")).default
        const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
        await client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
          to:   `whatsapp:${args.phone}`,
          body: `Your ConsultEase verification code is: ${code}`,
        })
      } catch (err) {
        console.error("[chat-book] Twilio failed:", err)
        sandboxCode = code
      }
    } else {
      console.log(`[chat-book] OTP sandbox — phone: ${args.phone}  code: ${code}`)
      sandboxCode = code
    }

    return { result: { sent: true, sandboxCode } }
  }

  if (name === "create_booking") {
    const otpResult: string = await verifyOTP(args.customer_phone, args.otp_code)
    if (otpResult !== "valid") {
      const msg: Record<string, string> = {
        invalid: "The verification code is incorrect.",
        expired: "The verification code has expired — please request a new one.",
        used:    "This code has already been used — please request a new one.",
      }
      return { result: { success: false, error: msg[otpResult] ?? "Invalid code." } }
    }

    const consultants = await getAllConsultantsWithSchedules()
    const c = consultants.find((x) => x.id === args.consultant_id)
    if (!c) return { result: { success: false, error: "Consultant not found." } }

    const booking: Booking = {
      id:                  crypto.randomUUID(),
      customerName:        args.customer_name.trim(),
      customerPhone:       args.customer_phone.trim(),
      consultantId:        c.id,
      consultantName:      c.name,
      consultantSpecialty: c.specialty,
      consultantAvatarUrl: c.avatarUrl,
      date:                args.date,
      timeSlot:            args.time_slot,
      sessionType:         args.session_type as "online" | "in_person",
      notes:               args.notes?.trim() || undefined,
      status:              "confirmed",
      createdAt:           new Date().toISOString(),
      hourlyRate:          c.hourlyRate,
    }
    addBookingServer(booking)
    return { result: { success: true, bookingId: booking.id }, bookingCreated: booking }
  }

  return { result: { error: `Unknown tool: ${name}` } }
}

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an AI booking assistant for ConsultEase, a professional consultation platform. You help users find the right consultant and complete a booking entirely through conversation.

## Your capabilities
- Search for consultants that match the user's needs (RAG-powered)
- Show available dates and times
- Send a phone verification code (OTP) and confirm it
- Create a confirmed booking

## Booking flow
1. Understand what the user needs (ask 1 focused question if unclear)
2. Call search_consultants to find relevant consultants, then present the top 1-2 results concisely
3. Once the user picks a consultant, call get_slots to show available times
4. Collect the user's preferred date/time and session type (online or in-person)
5. Ask for the user's full name and phone number (with country code, e.g. +965...)
6. Call send_otp; if the result contains a sandboxCode share it with the user as a test code
7. Ask for the OTP the user received
8. Call create_booking — if successful, confirm enthusiastically with a summary
9. If create_booking fails tell the user and let them retry

## Style guidelines
- Be warm, concise, and helpful — max 3 sentences per response unless showing slot lists
- Format consultant profiles clearly: name, specialty, ⭐ rating, 💰 rate
- Present available dates as a numbered list for easy selection
- If the user writes in Arabic, reply in Arabic
- Never invent consultants or details not returned by the tools
- Today's date is ${format(new Date(), "EEEE, MMMM d, yyyy")}`

// ─── Agentic streaming loop ───────────────────────────────────────────────────

async function runLoop(
  messages: ChatCompletionMessageParam[],
  onText:  (chunk: string) => void,
): Promise<Booking | null> {
  if (!isOpenRouterConfigured()) {
    onText("AI chat is not configured. Please add OPENROUTER_API_KEY to your environment.")
    return null
  }

  const client       = getOpenRouterClient()!
  const history: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ]
  let bookingCreated: Booking | null = null
  const MAX_ITERS = 10

  for (let iter = 0; iter < MAX_ITERS; iter++) {
    const response = await client.chat.completions.create({
      model:      OR_MODEL,
      max_tokens: 1024,
      tools:      TOOLS,
      messages:   history,
    })

    const choice  = response.choices[0]
    const message = choice.message

    // Add assistant turn to history
    history.push(message)

    // Stream any text content
    if (message.content) {
      onText(message.content)
    }

    // If no tool calls, we're done
    if (choice.finish_reason === "stop" || !message.tool_calls?.length) break

    // Execute each tool call and collect results
    for (const tc of message.tool_calls as ChatCompletionMessageToolCall[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn   = (tc as any).function as { name: string; arguments: string }
      let args: ToolArgs = {}
      try { args = JSON.parse(fn.arguments) } catch { /* ignore */ }

      const { result, bookingCreated: created } = await executeTool(fn.name, args)
      if (created) bookingCreated = created

      history.push({
        role:         "tool",
        tool_call_id: tc.id,
        content:      JSON.stringify(result),
      })
    }
    // Continue loop — Claude will process tool results
  }

  return bookingCreated
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages } = await req.json().catch(() => ({ messages: [] }))
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const booking = await runLoop(messages as ChatCompletionMessageParam[], (chunk) => {
          controller.enqueue(encoder.encode(chunk))
        })

        if (booking) {
          const marker = `\n\n<!--BOOKING:${JSON.stringify({
            id:              booking.id,
            consultantName:  booking.consultantName,
            consultantAvatar: booking.consultantAvatarUrl,
            date:            booking.date,
            timeSlot:        booking.timeSlot,
            sessionType:     booking.sessionType,
            hourlyRate:      booking.hourlyRate,
          })}-->`
          controller.enqueue(encoder.encode(marker))
        }
      } catch (err) {
        console.error("[chat-book] error:", err)
        controller.enqueue(encoder.encode("\n\nSorry, something went wrong. Please try again."))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}
