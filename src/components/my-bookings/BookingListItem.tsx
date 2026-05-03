"use client"

import { useState } from "react"
import Image from "next/image"
import { Booking } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BookingStatusBadge from "./BookingStatusBadge"
import CancelDialog from "./CancelDialog"
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from "@/lib/utils"
import { CalendarDays, Clock, Monitor, MapPin, X } from "lucide-react"

interface Props {
  booking: Booking
  onCancel: (id: string) => void
}

export default function BookingListItem({ booking, onCancel }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Card className="border border-gray-100 hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Avatar */}
            <div className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-teal-100">
              <Image
                src={booking.consultantAvatarUrl}
                alt={booking.consultantName}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="font-bold text-gray-900">{booking.consultantName}</div>
                  <div className="text-sm text-gray-500">{booking.consultantSpecialty}</div>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-teal-500" />
                  {formatDateDisplay(booking.date)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-teal-500" />
                  {formatTimeDisplay(booking.timeSlot)}
                </div>
                {booking.sessionType && (
                  <div className="flex items-center gap-1.5">
                    {booking.sessionType === "online"
                      ? <Monitor className="h-4 w-4 text-teal-500" />
                      : <MapPin className="h-4 w-4 text-teal-500" />}
                    {booking.sessionType === "online" ? "Online" : "In Person"}
                  </div>
                )}
                <div className="font-semibold text-teal-700">
                  {formatCurrency(booking.hourlyRate)}/hr
                </div>
              </div>

              {booking.summary && (
                <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  &ldquo;{booking.summary}&rdquo;
                </div>
              )}
            </div>

            {/* Cancel action */}
            {(booking.status === "confirmed" || booking.status === "pending") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CancelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        consultantName={booking.consultantName}
        onConfirm={() => onCancel(booking.id)}
      />
    </>
  )
}
