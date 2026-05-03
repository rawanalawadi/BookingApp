"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Booking } from "@/lib/types"
import BookingConfirmationCard from "@/components/booking/BookingConfirmationCard"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    fetch(`/api/bookings/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => { setBooking(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [id])

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      {loading ? (
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : !booking ? (
        <div className="max-w-lg mx-auto text-center py-20">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find this booking. It may have been cancelled or the link may be incorrect.
          </p>
          <Link href="/consultants">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">Browse Consultants</Button>
          </Link>
        </div>
      ) : (
        <BookingConfirmationCard booking={booking} />
      )}
    </div>
  )
}
