import fs from "fs"
import path from "path"

const OTP_FILE = path.join(process.cwd(), "src/lib/otps.json")

interface OTPEntry {
  phone: string
  code: string
  expiresAt: number
  used: boolean
}

function readStore(): OTPEntry[] {
  try {
    return JSON.parse(fs.readFileSync(OTP_FILE, "utf-8")) as OTPEntry[]
  } catch {
    return []
  }
}

function writeStore(entries: OTPEntry[]): void {
  // Keep only unexpired entries to avoid the file growing unboundedly
  const now = Date.now()
  const pruned = entries.filter((e) => e.expiresAt > now)
  fs.writeFileSync(OTP_FILE, JSON.stringify(pruned, null, 2), "utf-8")
}

export function createOTP(phone: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const entries = readStore().filter((e) => e.phone !== phone) // remove old entries for same phone
  entries.push({ phone, code, expiresAt: Date.now() + 10 * 60 * 1000, used: false })
  writeStore(entries)
  return code
}

export type OTPResult = "valid" | "invalid" | "expired" | "used"

export function verifyOTP(phone: string, code: string): OTPResult {
  const entries = readStore()
  const idx = entries.findIndex((e) => e.phone === phone)
  if (idx === -1) return "invalid"

  const entry = entries[idx]
  if (entry.used) return "used"
  if (Date.now() > entry.expiresAt) return "expired"
  if (entry.code !== code.trim()) return "invalid"

  entries[idx] = { ...entry, used: true }
  writeStore(entries)
  return "valid"
}
