"use client"

import { useState, useEffect } from "react"
import { Consultant } from "@/lib/types"
import ConsultantCard from "@/components/consultants/ConsultantCard"
import SpecialtyFilter from "@/components/consultants/SpecialtyFilter"
import { Skeleton } from "@/components/ui/skeleton"

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState("All")

  useEffect(() => {
    fetch("/api/consultants")
      .then((r) => r.json())
      .then((data: Consultant[]) => {
        setConsultants(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const specialties = ["All", ...Array.from(new Set(consultants.map((c) => c.specialty))).sort()]
  const filtered = selected === "All" ? consultants : consultants.filter((c) => c.specialty === selected)

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
            specialties={specialties}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
