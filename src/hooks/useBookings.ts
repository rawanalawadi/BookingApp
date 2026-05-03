"use client"

import { useState, useEffect } from "react"
import { Booking } from "@/lib/types"
import { getBookings, addBooking, cancelBooking } from "@/lib/bookings"

export function useBookings(email: string | null | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (email) {
      setBookings(getBookings(email))
    }
    setLoading(false)
  }, [email])

  function book(booking: Booking) {
    if (!email) return
    addBooking(email, booking)
    setBookings(getBookings(email))
  }

  function cancel(id: string) {
    if (!email) return
    cancelBooking(email, id)
    setBookings(getBookings(email))
  }

  return { bookings, loading, book, cancel }
}
