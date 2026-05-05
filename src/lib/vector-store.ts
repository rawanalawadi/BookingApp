/**
 * File-backed vector store for consultant embeddings.
 *
 * On first use (or when new consultants are added) it auto-indexes them.
 * Falls back to keyword scoring when OpenAI is not configured.
 */

import fs from "fs"
import path from "path"
import { embedText, cosineSimilarity, keywordScore, isOpenAIConfigured } from "./embeddings"
import type { Consultant } from "./types"

const STORE_PATH = path.join(process.cwd(), "src/lib/consultant-vectors.json")

interface VectorEntry {
  id:        string
  docText:   string
  embedding: number[]
}

// ── serialisation ─────────────────────────────────────────────────────────────

function readStore(): VectorEntry[] {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"))
  } catch {
    return []
  }
}

function writeStore(entries: VectorEntry[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(entries, null, 2))
}

// ── document builder ──────────────────────────────────────────────────────────

export function consultantToDoc(c: Consultant): string {
  return [
    `Name: ${c.name}`,
    `Specialty: ${c.specialty}`,
    `Bio: ${c.bio}`,
    `Tags: ${(c.tags ?? []).join(", ")}`,
    `Rate: KWD ${c.hourlyRate} per hour`,
    `Online sessions: ${c.offersOnline !== false ? "yes" : "no"}`,
    `In-person sessions: ${c.offersInPerson !== false ? "yes" : "no"}`,
    `Rating: ${c.rating ?? "N/A"} out of 5`,
  ].join("\n")
}

// ── indexing ──────────────────────────────────────────────────────────────────

export async function ensureIndexed(consultants: Consultant[]): Promise<void> {
  if (!isOpenAIConfigured()) return   // keyword fallback needs no pre-indexing

  const store   = readStore()
  const indexed = new Set(store.map((e) => e.id))
  const missing = consultants.filter((c) => !indexed.has(c.id))
  if (missing.length === 0) return

  const updated: VectorEntry[] = [...store]
  for (const c of missing) {
    const docText  = consultantToDoc(c)
    const embedding = await embedText(docText)
    if (embedding) {
      updated.push({ id: c.id, docText, embedding })
    }
  }
  writeStore(updated)
}

// ── search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  consultant: Consultant
  score:      number
}

export async function searchConsultants(
  query: string,
  consultants: Consultant[],
  topK = 3,
): Promise<SearchResult[]> {
  if (consultants.length === 0) return []

  // ── semantic path (OpenAI) ────────────────────────────────────────────────
  if (isOpenAIConfigured()) {
    await ensureIndexed(consultants)
    const store = readStore()
    const queryVec = await embedText(query)
    if (queryVec && store.length > 0) {
      return store
        .map((entry) => ({
          consultant: consultants.find((c) => c.id === entry.id)!,
          score:      cosineSimilarity(queryVec, entry.embedding),
        }))
        .filter((r) => r.consultant != null)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
    }
  }

  // ── keyword fallback ──────────────────────────────────────────────────────
  return consultants
    .map((c) => ({
      consultant: c,
      score:      keywordScore(consultantToDoc(c), query),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
