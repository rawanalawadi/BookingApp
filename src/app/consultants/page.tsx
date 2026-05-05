"use client"

import { useState } from "react"
import { CONSULTANTS, SPECIALTIES } from "@/lib/data"
import ConsultantCard from "@/components/consultants/ConsultantCard"
import SpecialtyFilter from "@/components/consultants/SpecialtyFilter"

export default function ConsultantsPage() {
  const [selected, setSelected] = useState("All")

  const filtered =
    selected === "All" ? CONSULTANTS : CONSULTANTS.filter((c) => c.specialty === selected)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Our Consultants</h1>
          <p className="text-gray-500">Browse and book sessions with our verified experts.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
        {/* Filter */}
        <div className="mb-5 md:mb-8">
          <SpecialtyFilter
            specialties={SPECIALTIES}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No consultants found for this specialty.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((consultant) => (
              <ConsultantCard key={consultant.id} consultant={consultant} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
