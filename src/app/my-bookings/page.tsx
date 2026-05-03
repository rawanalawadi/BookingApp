"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { isPast, parseISO, setHours, setMinutes } from "date-fns"
import BookingListItem from "@/components/my-bookings/BookingListItem"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Booking } from "@/lib/types"
import { CalendarDays, Inbox } from "lucide-react"
import { toast } from "sonner"

function isBookingPast(booking: Booking): boolean {
  const [hours, minutes] = booking.timeSlot.split(":").map(Number)
  const sessionDate = setMinutes(setHours(parseISO(booking.date), hours), minutes)
  return isPast(sessionDate)
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => {
          setBookings(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else if (status !== "loading") {
      setLoading(false)
    }
  }, [status])

  async function handleCancel(id: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    })
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      )
      toast.success("Booking cancelled.")
    } else {
      toast.error("Failed to cancel booking.")
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && !isBookingPast(b)
  )
  const pastBookings = bookings.filter(
    (b) => b.status === "cancelled" || b.status === "pending" || isBookingPast(b)
  )

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Bookings</h1>
          <p className="text-gray-500">
            {session?.user?.name
              ? `Welcome back, ${session.user.name.split(" ")[0]}!`
              : "Your consultation history."}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upcoming */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
            <span className="ml-1 bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {upcomingBookings.length}
            </span>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
              <Inbox className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                No upcoming sessions.{" "}
                <a href="/consultants" className="text-teal-600 hover:underline font-medium">
                  Browse consultants
                </a>{" "}
                to book one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <BookingListItem key={b.id} booking={b} onCancel={handleCancel} />
              ))}
            </div>
          )}
        </section>

        {pastBookings.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Past &amp; Cancelled</h2>
              <div className="space-y-3 opacity-75">
                {pastBookings.map((b) => (
                  <BookingListItem key={b.id} booking={b} onCancel={handleCancel} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
