/**
 * Embedding utilities — uses OpenAI text-embedding-3-small when OPENAI_API_KEY
 * is present, otherwise falls back to a lightweight BM25-style keyword scorer
 * so the feature works out of the box even without an OpenAI key.
 */

import type OpenAI from "openai"

// ── OpenAI client (lazy) ──────────────────────────────────────────────────────

let _oa: OpenAI | null = null

async function getOAClient(): Promise<OpenAI | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key || key === "your-openai-api-key-here") return null
  if (!_oa) {
    const { default: OpenAIClass } = await import("openai")
    _oa = new OpenAIClass({ apiKey: key })
  }
  return _oa
}

// ── Public: embed a single string ─────────────────────────────────────────────

export async function embedText(text: string): Promise<number[] | null> {
  const client = await getOAClient()
  if (!client) return null
  try {
    const res = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    })
    return res.data[0].embedding
  } catch {
    return null
  }
}

// ── Cosine similarity ─────────────────────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

// ── Keyword fallback (BM25-lite) ──────────────────────────────────────────────

export function keywordScore(doc: string, query: string): number {
  const docTokens  = doc.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  const queryTerms = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  let score = 0
  for (const term of queryTerms) {
    for (const token of docTokens) {
      if (token === term)        score += 2   // exact match
      else if (token.includes(term) || term.includes(token)) score += 1  // partial
    }
  }
  return score
}

export function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY
  return !!key && key !== "your-openai-api-key-here"
}
