/**
 * Shared AI client factory.
 *
 * Priority:
 *   1. OPENROUTER_API_KEY  →  OpenAI SDK pointed at https://openrouter.ai/api/v1
 *   2. ANTHROPIC_API_KEY   →  native Anthropic SDK (handled per-route)
 *
 * Both paths expose Claude 3.5 Haiku — the model is the same, only the wire
 * format differs (OpenAI-compatible vs Anthropic native).
 */

import OpenAI from "openai"

// Default model used through OpenRouter
export const OR_MODEL = "anthropic/claude-3.5-haiku"

let _orClient: OpenAI | null = null

export function getOpenRouterClient(): OpenAI | null {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  if (!_orClient) {
    _orClient = new OpenAI({
      apiKey:  key,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
        "X-Title":      "ConsultEase",
      },
    })
  }
  return _orClient
}

export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY
}

export function isAnthropicConfigured(): boolean {
  const k = process.env.ANTHROPIC_API_KEY
  return !!k && k !== "your-anthropic-api-key-here"
}

/** Returns true if at least one AI backend is available */
export function isAIConfigured(): boolean {
  return isOpenRouterConfigured() || isAnthropicConfigured()
}
