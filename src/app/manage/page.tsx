"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Booking, Consultant } from "@/lib/types"
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Search, CalendarDays, Clock, Monitor, MapPin,
  XCircle, Loader2, AlertTriangle, CalendarCheck, ArrowRight,
  CheckCircle2, MessageSquare, RefreshCw, ShieldCheck, Pencil,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ModifyPanel from "@/components/booking/ModifyPanel"
import PhoneInput, { buildPhone } from "@/components/ui/PhoneInput"

type Step = "lookup" | "otp" | "results"

function StatusBadge({ status }: { status: Booking["status"] }) {
  const map = {
    confirmed: "bg-orange-50 text-orange-600 border-orange-200",
    pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    completed: "bg-gray-50 text-gray-500 border-gray-200",
  }
  const labels = { confirmed: "Confirmed", pending: "Pending", cancelled: "Cancelled", completed: "Completed" }
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border", map[status] ?? map.pending)}>
      {labels[status] ?? status}
    </span>
  )
}

export default function ManagePage() {
  const [step, setStep] = useState<Step>("lookup")
  const [countryCode, setCountryCode] = useState("+965")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [submittedPhone, setSubmittedPhone] = useState("")

  // OTP state
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [sandboxCode, setSandboxCode] = useState<string | null>(null)

  // Results state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [error, setError] = useState("")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  // Modify state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editConsultant, setEditConsultant] = useState<Consultant | null>(null)
  const [fetchingConsultant, setFetchingConsultant] = useState(false)

  async function handleStartEdit(booking: Booking) {
    if (editingId === booking.id) { setEditingId(null); return }
    setFetchingConsultant(true)
    setEditingId(booking.id)
    setConfirmCancelId(null)
    const res = await fetch(`/api/consultants/${booking.consultantId}`)
    const data = await res.json()
    setEditConsultant(res.ok ? data : null)
    setFetchingConsultant(false)
  }

  function handleModified(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setEditingId(null)
    setEditConsultant(null)
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    const digits = phoneNumber.replace(/\D/g, "")
    if (digits.length < 7) return
    const fullPhone = buildPhone(countryCode, phoneNumber)
    setSendingOtp(true)
    setError("")

    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullPhone }),
    })

    setSendingOtp(false)
    if (!res.ok) {
      setError("Failed to send verification code. Please try again.")
      return
    }

    const data = await res.json()
    setSandboxCode(data.sandboxCode ?? null)
    setSubmittedPhone(fullPhone)
    setOtp("")
    setOtpError("")
    setStep("otp")
  }

  async function handleResendOTP() {
    setSendingOtp(true)
    setOtpError("")
    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: submittedPhone }),
    })
    setSendingOtp(false)
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    if (otp.trim().length !== 6) {
      setOtpError("Please enter the 6-digit code.")
      return
    }
    setVerifyingOtp(true)
    setOtpError("")

    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: submittedPhone, code: otp.trim() }),
    })

    const data = await res.json()
    setVerifyingOtp(false)

    if (!res.ok) {
      setOtpError(data.error ?? "Incorrect code. Please try again.")
      return
    }

    // Fetch bookings
    setLoadingBookings(true)
    const bookRes = await fetch(`/api/bookings/by-phone?phone=${encodeURIComponent(submittedPhone)}`)
    const bookData = await bookRes.json()
    setLoadingBookings(false)

    if (!bookRes.ok) {
      setError(bookData.error ?? "Something went wrong.")
      setStep("lookup")
      return
    }

    setBookings(bookData)
    setStep("results")
  }

  async function handleCancel(bookingId: string) {
    setCancellingId(bookingId)
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", phone: submittedPhone }),
    })
    setCancellingId(null)
    setConfirmCancelId(null)

    if (res.ok) {
      setCancelledIds((prev) => new Set(prev).add(bookingId))
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      )
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-rose-50 rounded-full mb-4">
            <CalendarCheck className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Booking</h1>
          <p className="text-gray-500 text-sm">
            {step === "lookup" && "Enter the phone number you used when booking."}
            {step === "otp" && `Enter the verification code sent to ${submittedPhone}.`}
            {step === "results" && "Your upcoming sessions are listed below."}
          </p>
        </div>

        {/* Step 1 — Phone lookup */}
        {step === "lookup" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSendOTP} className="space-y-3">
              <PhoneInput
                countryCode={countryCode}
                number={phoneNumber}
                onCountryChange={setCountryCode}
                onNumberChange={setPhoneNumber}
                placeholder="XXXX XXXX"
              />
              <Button
                type="submit"
                disabled={sendingOtp || phoneNumber.replace(/\D/g, "").length < 7}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-2"
              >
                {sendingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><ShieldCheck className="h-4 w-4" /> Send Verification Code</>
                )}
              </Button>
            </form>
            {error && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
          </div>
        )}

        {/* Step 2 — OTP entry */}
        {step === "otp" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
            {/* Sandbox banner — only shown when Twilio is not configured */}
            {sandboxCode && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">🧪 Sandbox mode</p>
                  <p className="text-sm text-amber-800">
                    Your code: <span className="font-mono font-bold tracking-widest">{sandboxCode}</span>
                  </p>
                </div>
                <button
                  onClick={() => { setOtp(sandboxCode); setOtpError("") }}
                  className="shrink-0 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Use code
                </button>
              </div>
            )}

            <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2.5">
              <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
              <span>
                {sandboxCode
                  ? <>WhatsApp not configured — use the sandbox code above.</>
                  : <>A 6-digit code was sent to <span className="font-semibold">{submittedPhone}</span> via WhatsApp.</>
                }
              </span>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError("") }}
                placeholder="Enter 6-digit code"
                autoFocus
                className={cn(
                  "w-full rounded-lg border px-3 py-3 text-center tracking-[0.5em] font-mono text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent",
                  otpError ? "border-red-300 bg-red-50" : "border-gray-200"
                )}
              />
              {otpError && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {otpError}
                </p>
              )}

              <Button
                type="submit"
                disabled={verifyingOtp || loadingBookings || otp.trim().length !== 6}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold"
              >
                {verifyingOtp || loadingBookings ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" /> View My Bookings</>
                )}
              </Button>
            </form>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <button
                onClick={() => { setStep("lookup"); setOtp(""); setOtpError("") }}
                className="hover:text-gray-600 transition-colors"
              >
                ← Change phone number
              </button>
              <button
                onClick={handleResendOTP}
                disabled={sendingOtp}
                className="flex items-center gap-1 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={cn("h-3 w-3", sendingOtp && "animate-spin")} />
                {sendingOtp ? "Sending…" : "Resend code"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Results */}
        {step === "results" && (
          <>
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-gray-600 mb-1">No upcoming bookings found</p>
                <p className="text-sm mb-6">No active sessions were found for that phone number.</p>
                <Link href="/consultants">
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                    Browse Experts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 px-1">
                  {bookings.filter((b) => b.status !== "cancelled").length} upcoming session
                  {bookings.filter((b) => b.status !== "cancelled").length !== 1 ? "s" : ""} found
                </p>

                {bookings.map((booking) => {
                  const isCancelled = booking.status === "cancelled" || cancelledIds.has(booking.id)
                  const isConfirming = confirmCancelId === booking.id
                  const isCancelling = cancellingId === booking.id

                  return (
                    <div
                      key={booking.id}
                      className={cn(
                        "bg-white rounded-2xl border shadow-sm overflow-hidden transition-opacity",
                        isCancelled ? "opacity-50" : "border-gray-100"
                      )}
                    >
                      <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0">
                          <Image
                            src={booking.consultantAvatarUrl}
                            alt={booking.consultantName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{booking.consultantName}</p>
                          <p className="text-rose-100 text-xs">{booking.consultantSpecialty}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="px-5 py-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarDays className="h-4 w-4 text-rose-500 shrink-0" />
                          <span className="font-medium">{formatDateDisplay(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4 text-rose-500 shrink-0" />
                          <span className="font-medium">{formatTimeDisplay(booking.timeSlot)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          {booking.sessionType === "online"
                            ? <Monitor className="h-4 w-4 text-rose-500 shrink-0" />
                            : <MapPin className="h-4 w-4 text-rose-500 shrink-0" />}
                          <span className="font-medium">
                            {booking.sessionType === "online" ? "Online" : "In Person"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-1">
                          <span className="text-gray-400 text-xs font-mono">
                            Ref: {(booking.paymentReference ?? booking.id).slice(0, 12).toUpperCase()}
                          </span>
                          <span className="font-bold text-rose-600 text-sm">{formatCurrency(booking.hourlyRate)}/hr</span>
                        </div>
                      </div>

                      {!isCancelled && (
                        <>
                          <div className="px-5 pb-4 flex items-center justify-between gap-4">
                            <button
                              onClick={() => handleStartEdit(booking)}
                              className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
                            >
                              {fetchingConsultant && editingId === booking.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Pencil className="h-3.5 w-3.5" />
                              )}
                              {editingId === booking.id ? "Close" : "Modify booking"}
                            </button>

                            {!isConfirming ? (
                              <button
                                onClick={() => setConfirmCancelId(booking.id)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                            ) : (
                              <div className="flex-1 bg-red-50 rounded-xl p-3 border border-red-100">
                                <p className="text-sm font-semibold text-red-700 mb-1 flex items-center gap-1.5">
                                  <AlertTriangle className="h-4 w-4" />
                                  Cancel this session?
                                </p>
                                <p className="text-xs text-red-500 mb-3">
                                  This cannot be undone. Your slot will be released.
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmCancelId(null)}
                                    className="flex-1 text-xs border-gray-200"
                                  >
                                    Keep it
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleCancel(booking.id)}
                                    disabled={isCancelling}
                                    className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    {isCancelling ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : "Yes, cancel"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {editingId === booking.id && editConsultant && (
                            <ModifyPanel
                              booking={booking}
                              consultant={editConsultant}
                              phone={submittedPhone}
                              onSave={handleModified}
                              onCancel={() => { setEditingId(null); setEditConsultant(null) }}
                            />
                          )}
                        </>
                      )}

                      {isCancelled && (
                        <div className="px-5 pb-4">
                          <p className="text-xs text-gray-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Booking cancelled
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="pt-2 text-center">
                  <Link href="/consultants">
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-600">
                      Book a New Session
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
