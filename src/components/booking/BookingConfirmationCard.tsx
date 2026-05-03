import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, CalendarDays, Clock, ArrowRight, ClipboardList, Monitor, MapPin, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Booking } from "@/lib/types"
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from "@/lib/utils"

export default function BookingConfirmationCard({ booking }: { booking: Booking }) {
  return (
    <div className="max-w-lg mx-auto">
      {/* Success badge */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-emerald-50 rounded-full mb-4">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
        <p className="text-gray-500">
          Your consultation is booked and payment received.
          A confirmation has been sent to your email.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Consultant header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/50 flex-shrink-0">
            <Image
              src={booking.consultantAvatarUrl}
              alt={booking.consultantName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-white font-bold text-lg">{booking.consultantName}</div>
            <div className="text-teal-100 text-sm">{booking.consultantSpecialty}</div>
          </div>
          {booking.paymentReference && (
            <div className="ml-auto text-right shrink-0">
              <div className="text-teal-200 text-xs">Ref.</div>
              <div className="text-white text-xs font-mono">{booking.paymentReference}</div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 text-gray-700">
            <CalendarDays className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Date</div>
              <div className="font-semibold">{formatDateDisplay(booking.date)}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-gray-700">
            <Clock className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Time</div>
              <div className="font-semibold">{formatTimeDisplay(booking.timeSlot)}</div>
            </div>
          </div>

          {booking.sessionType && (
            <div className="flex items-start gap-3 text-gray-700">
              {booking.sessionType === "online"
                ? <Monitor className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                : <MapPin className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Session Type</div>
                <div className="font-semibold">
                  {booking.sessionType === "online" ? "Online (Video Call)" : "In Person"}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 flex justify-between">
            <span className="text-gray-500 text-sm">Session Rate</span>
            <span className="font-bold text-teal-700">{formatCurrency(booking.hourlyRate)}/hr</span>
          </div>

          {booking.summary && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                <FileText className="h-3.5 w-3.5" />
                Your Consultation Brief
              </div>
              {booking.summary}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link href="/my-bookings" className="flex-1">
          <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            <ClipboardList className="mr-2 h-4 w-4" />
            View My Bookings
          </Button>
        </Link>
        <Link href="/consultants" className="flex-1">
          <Button variant="outline" className="w-full border-gray-200">
            Book Another
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
