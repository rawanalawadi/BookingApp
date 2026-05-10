"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Star, Clock, Info, X, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Consultant } from "@/lib/types"
import { useCurrency } from "@/contexts/CurrencyContext"
import BookingPanel from "@/components/booking/BookingPanel"

function Modal({
  open,
  onClose,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}) {
  if (!open || typeof window === "undefined") return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white w-full sm:rounded-2xl shadow-2xl flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh] ${className ?? ""}`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default function ConsultantCard({ consultant }: { consultant: Consultant }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const { format } = useCurrency()

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
        <CardContent className="p-4 md:p-6 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative h-14 w-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-rose-100">
              <Image
                src={consultant.avatarUrl}
                alt={consultant.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-gray-900 text-base truncate">{consultant.name}</h3>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="shrink-0 p-0.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  aria-label={`About ${consultant.name}`}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <Badge className="mt-1 bg-rose-50 text-rose-600 border-rose-200 text-xs font-medium">
                {consultant.specialty}
              </Badge>
            </div>
          </div>

          {/* Rating & rate */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-gray-800">{consultant.rating}</span>
              <span className="text-gray-400">({consultant.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-rose-500" />
              <span className="font-semibold text-gray-800">{format(consultant.hourlyRate)}</span>
              <span className="text-gray-400">/hr</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {consultant.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {tag}
              </span>
            ))}
            {consultant.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                +{consultant.tags.length - 3}
              </span>
            )}
          </div>

          <div className="mt-auto">
            <Button
              onClick={() => setBookingOpen(true)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold"
            >
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info modal */}
      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} className="sm:max-w-sm">
        {/* sticky header */}
        <div className="shrink-0 bg-gradient-to-r from-rose-500 to-orange-500 px-6 pt-6 pb-5 flex gap-4 items-start rounded-t-2xl sm:rounded-t-2xl">
          <div className="relative h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-white/40 shrink-0">
            <Image src={consultant.avatarUrl} alt={consultant.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-white font-bold text-lg leading-tight">{consultant.name}</h2>
            <p className="text-rose-100 text-sm mt-0.5">{consultant.specialty}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
                {consultant.rating} ({consultant.reviewCount})
              </span>
              <span>{format(consultant.hourlyRate)}/hr</span>
            </div>
          </div>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{consultant.bio}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Specializations
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {consultant.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={() => { setInfoOpen(false); setBookingOpen(true) }}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold mt-2"
          >
            Book a Session
          </Button>
        </div>
      </Modal>

      {/* Booking modal */}
      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} className="sm:max-w-md">
        {/* sticky header */}
        <div className="shrink-0 bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 flex items-center gap-3 rounded-t-2xl sm:rounded-t-2xl">
          <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0">
            <Image src={consultant.avatarUrl} alt={consultant.name} fill className="object-cover" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{consultant.name}</p>
            <p className="text-rose-100 text-xs">{consultant.specialty} · {format(consultant.hourlyRate)}/hr</p>
          </div>
        </div>
        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto p-4">
          <BookingPanel consultant={consultant} />
        </div>
      </Modal>
    </>
  )
}
