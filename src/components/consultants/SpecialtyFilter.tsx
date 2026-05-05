"use client"

import { cn } from "@/lib/utils"

interface Props {
  specialties: string[]
  selected: string
  onSelect: (specialty: string) => void
}

export default function SpecialtyFilter({ specialties, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {specialties.map((specialty) => (
        <button
          key={specialty}
          onClick={() => onSelect(specialty)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            selected === specialty
              ? "bg-rose-500 text-white border-rose-500 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-rose-400 hover:text-rose-500"
          )}
        >
          {specialty}
        </button>
      ))}
    </div>
  )
}
