import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2, CalendarDays, Clock, ArrowRight,
  Monitor, MapPin, FileText, User, Phone,
  ChevronRight, Mail, Bell, Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Booking } from "@/lib/types"
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from "@/lib/utils"

export default function BookingConfirmationCard({ booking }: { booking: Booking }) {
  return (
    <div className="max-w-lg mx-auto">
      {/* Success badge */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-orange-50 rounded-full mb-4">
          <CheckCircle2 className="h-14 w-14 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
        <p className="text-gray-500 text-sm">
          Your session is locked in. A confirmation will be sent to you shortly.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Consultant header */}
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-5 flex items-center gap-4">
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
            <div className="text-rose-100 text-sm">{booking.consultantSpecialty}</div>
          </div>
          {booking.paymentReference && (
            <div className="ml-auto text-right shrink-0">
              <div className="text-rose-200 text-xs">Ref.</div>
              <div className="text-white text-xs font-mono">{booking.paymentReference}</div>
            </div>
          )}
        </div>

        {/* Session details */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 text-gray-700">
            <CalendarDays className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Date</div>
              <div className="font-semibold">{formatDateDisplay(booking.date)}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-gray-700">
            <Clock className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Time</div>
              <div className="font-semibold">{formatTimeDisplay(booking.timeSlot)}</div>
            </div>
          </div>

          {booking.sessionType && (
            <div className="flex items-start gap-3 text-gray-700">
              {booking.sessionType === "online"
                ? <Monitor className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                : <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Session Type</div>
                <div className="font-semibold">
                  {booking.sessionType === "online" ? "Online (Video Call)" : "In Person"}
                </div>
              </div>
            </div>
          )}

          {/* Customer info */}
          <div className="flex items-start gap-3 text-gray-700">
            <User className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Name</div>
              <div className="font-semibold">{booking.customerName}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-gray-700">
            <Phone className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Phone</div>
              <div className="font-semibold">{booking.customerPhone}</div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between">
            <span className="text-gray-500 text-sm">Session Rate</span>
            <span className="font-bold text-rose-600">{formatCurrency(booking.hourlyRate)}/hr</span>
          </div>

          {booking.notes && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                <FileText className="h-3.5 w-3.5" />
                Your Notes
              </div>
              {booking.notes}
            </div>
          )}
        </div>
      </div>

      {/* What happens next */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">What happens next</h3>
        <div className="space-y-3">
          {[
            {
              icon: Mail,
              title: "Confirmation sent",
              desc: "Your booking details and reference number have been sent to you.",
            },
            {
              icon: Bell,
              title: "Reminder 24 hours before",
              desc: "We'll send you a reminder the day before your session.",
            },
            {
              icon: booking.sessionType === "online" ? Video : MapPin,
              title: booking.sessionType === "online" ? "Join via video call" : "Visit the consultant's office",
              desc: booking.sessionType === "online"
                ? "A video link will be shared with you before the session starts."
                : "The consultant will confirm the meeting address before your appointment.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 rounded-lg shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6">
        <Link href="/consultants">
          <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">
            Book Another Session
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="w-full mt-2 text-gray-500">
            Back to Home
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
