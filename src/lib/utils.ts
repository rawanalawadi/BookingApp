import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KW", { style: "currency", currency: "KWD" }).format(amount)
}

export function formatDateDisplay(dateStr: string): string {
  return format(parseISO(dateStr), "EEEE, MMMM d, yyyy")
}

/** Strips all whitespace from a phone number so +965 1234 5678 → +96512345678 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim()
}

export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":")
  const h = parseInt(hours)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}
