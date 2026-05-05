"use client"

import { Consultant, SessionType } from "@/lib/types"
import { Monitor, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  consultant: Consultant
  selected: SessionType | null
  onSelect: (type: SessionType) => void
}

export default function SessionTypePicker({ consultant, selected, onSelect }: Props) {
  const options: { type: SessionType; icon: typeof Monitor; label: string; desc: string }[] = []

  if (consultant.offersOnline !== false) {
    options.push({ type: "online", icon: Monitor, label: "Online", desc: "Video call — join from anywhere" })
  }
  if (consultant.offersInPerson) {
    options.push({ type: "in_person", icon: MapPin, label: "In Person", desc: "Meet at the consultant's office" })
  }

  if (options.length === 0) {
    options.push({ type: "online", icon: Monitor, label: "Online", desc: "Video call — join from anywhere" })
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map(({ type, icon: Icon, label, desc }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
            selected === type
              ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500"
              : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
          )}
        >
          <div className={cn(
            "p-2 rounded-lg",
            selected === type ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className={cn("text-sm font-semibold", selected === type ? "text-rose-600" : "text-gray-800")}>
              {label}
            </div>
            <div className="text-xs text-gray-500">{desc}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
