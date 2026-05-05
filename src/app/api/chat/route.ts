export const dynamic = "force-dynamic"

import Anthropic from "@anthropic-ai/sdk"
import { getConsultantMetas } from "@/lib/consultants-server"

async function buildSystemPrompt(): Promise<string> {
  const consultants = await getConsultantMetas()
  const list = consultants.map(
    (c) =>
      `- **${c.name}** | ${c.specialty} | $${c.hourlyRate}/hr | ID: \`${c.id}\`\n  Specializes in: ${c.tags.join(", ")}\n  ${c.bio.slice(0, 120)}…`
  ).join("\n\n")

  return `You are a friendly booking assistant for ConsultEase. Help customers pick the right consultant for their needs, then guide them to book.

Available consultants:
${list}

Guidelines:
- Ask one focused question to understand what the customer needs
- Recommend 1–2 consultants max, with a short reason (1–2 sentences)
- Always end a recommendation with a booking link in this exact format: **[Book with NAME →](/consultants/ID)**
- Keep replies under 120 words. Be warm but get to the point.
- If the customer writes in Arabic, reply in Arabic.
- Never invent consultants or services not listed above.`
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    return Response.json({ error: "AI chat not configured" }, { status: 503 })
  }

  const { messages } = await req.json().catch(() => ({ messages: [] }))
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })
  const systemPrompt = await buildSystemPrompt()

  const stream = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    stream: true,
    system: systemPrompt,
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}
