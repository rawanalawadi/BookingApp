import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { Consultant } from "./types"

export type ConsultantMeta = Omit<Consultant, "availableSlots">

function getFilePath(): string {
  return path.join(process.cwd(), "src/lib/consultants.json")
}

export function getConsultantMetas(): ConsultantMeta[] {
  try {
    const raw = readFileSync(getFilePath(), "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveConsultantMetas(metas: ConsultantMeta[]): void {
  writeFileSync(getFilePath(), JSON.stringify(metas, null, 2))
}
