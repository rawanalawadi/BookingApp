"use client"

import { cn } from "@/lib/utils"

export const COUNTRY_CODES = [
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+20",  flag: "🇪🇬", name: "Egypt" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+1",   flag: "🇺🇸", name: "USA" },
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+63",  flag: "🇵🇭", name: "Philippines" },
]

interface Props {
  countryCode: string
  number: string
  onCountryChange: (code: string) => void
  onNumberChange: (num: string) => void
  error?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function PhoneInput({
  countryCode,
  number,
  onCountryChange,
  onNumberChange,
  error,
  placeholder = "XXXX XXXX",
  disabled,
  className,
}: Props) {
  return (
    <div className={cn("flex rounded-lg border overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent transition-all", error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white", className)}>
      {/* Country code selector */}
      <select
        value={countryCode}
        onChange={(e) => onCountryChange(e.target.value)}
        disabled={disabled}
        className="shrink-0 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-700 px-2 py-2.5 focus:outline-none cursor-pointer disabled:opacity-60"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>

      {/* Number input */}
      <input
        type="tel"
        value={number}
        onChange={(e) => onNumberChange(e.target.value.replace(/[^\d\s\-]/g, ""))}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none disabled:opacity-60 min-w-0"
      />
    </div>
  )
}

/** Combines country code + local number into a normalized E.164-ish string */
export function buildPhone(countryCode: string, number: string): string {
  const digits = number.replace(/\D/g, "")
  return `${countryCode}${digits}`
}
