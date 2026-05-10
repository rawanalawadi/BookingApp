"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Consultant, SessionType } from "@/lib/types"
import { formatDateDisplay, formatTimeDisplay, cn } from "@/lib/utils"
import { useCurrency } from "@/contexts/CurrencyContext"
import {
  CalendarCheck, Loader2, Monitor, MapPin, User, Phone,
  ShieldCheck, MessageSquare, RefreshCw, CreditCard,
} from "lucide-react"

type Phase = "form" | "otp" | "method" | "paying"

interface PaymentMethod {
  id: number
  nameEn: string
  nameAr: string
  code: string
  imageUrl: string
  totalAmount: number
  serviceCharge: number
  currencyIso: string
}

interface Props {
  consultant: Consultant
  selectedDate: Date
  selectedSlot: string
  sessionType: SessionType
}

export default function BookingForm({ consultant, selectedDate, selectedSlot, sessionType }: Props) {
  const router = useRouter()
  const { format: formatPrice } = useCurrency()

  // form fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [touched, setTouched] = useState({ name: false, phone: false })

  // OTP phase
  const [phase, setPhase] = useState<Phase>("form")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sandboxCode, setSandboxCode] = useState<string | null>(null)

  // Payment method phase
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [loadingMethods, setLoadingMethods] = useState(false)
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null)

  const nameError = touched.name && !name.trim()
  const phoneError = touched.phone && !phone.trim()
  const canProceed = name.trim().length > 0 && phone.trim().length > 0

  async function sendOTP() {
    setTouched({ name: true, phone: true })
    if (!canProceed) return
    setSending(true)
    setOtpError("")

    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim() }),
    })

    setSending(false)
    if (!res.ok) {
      toast.error("Failed to send verification code. Please try again.")
      return
    }

    const data = await res.json()
    setSandboxCode(data.sandboxCode ?? null)
    setOtp("")
    setPhase("otp")
  }

  async function verifyOTP() {
    if (otp.trim().length !== 6) {
      setOtpError("Please enter the 6-digit code.")
      return
    }
    setVerifying(true)
    setOtpError("")

    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim(), code: otp.trim() }),
    })

    const data = await res.json()
    setVerifying(false)

    if (!res.ok) {
      setOtpError(data.error ?? "Incorrect code. Please try again.")
      return
    }

    // Verified — create booking then show payment method picker
    setVerifying(true)

    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        consultantId: consultant.id,
        consultantName: consultant.name,
        consultantSpecialty: consultant.specialty,
        consultantAvatarUrl: consultant.avatarUrl,
        date: format(selectedDate, "yyyy-MM-dd"),
        timeSlot: selectedSlot,
        sessionType,
        notes: notes.trim() || undefined,
        hourlyRate: consultant.hourlyRate,
      }),
    })

    const bookingData = await bookingRes.json()
    setVerifying(false)
    if (!bookingRes.ok) {
      toast.error(bookingData.error ?? "Failed to create booking.")
      setPhase("otp")
      return
    }

    setPendingBookingId(bookingData.booking.id)
    setLoadingMethods(true)
    setPhase("method")

    // Fetch available payment methods
    const methodsRes = await fetch("/api/payment/methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: consultant.hourlyRate, currency: "KWD" }),
    })
    const methodsData = await methodsRes.json()
    setLoadingMethods(false)
    setPaymentMethods(methodsData.methods ?? [])
  }

  async function proceedToPayment() {
    if (!pendingBookingId || !selectedMethod) return
    setPhase("paying")

    const payRes = await fetch("/api/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: pendingBookingId, methodId: selectedMethod.id }),
    })

    const payData = await payRes.json()
    if (!payRes.ok) {
      toast.error("Payment initiation failed. Please try again.")
      setPhase("method")
      return
    }

    router.push(payData.paymentUrl)
  }

  return (
    <div className="space-y-4">
      {/* Booking summary */}
      <div className="bg-rose-50 rounded-xl p-4 text-sm space-y-1.5">
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Consultant</span>
          <span className="font-semibold">{consultant.name}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Date</span>
          <span className="font-semibold">{formatDateDisplay(format(selectedDate, "yyyy-MM-dd"))}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Time</span>
          <span className="font-semibold">{formatTimeDisplay(selectedSlot)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="text-gray-500">Type</span>
          <span className="font-semibold flex items-center gap-1">
            {sessionType === "online"
              ? <><Monitor className="h-3 w-3" /> Online</>
              : <><MapPin className="h-3 w-3" /> In Person</>}
          </span>
        </div>
        <div className="flex justify-between border-t border-rose-200 pt-2 mt-1">
          <span className="text-gray-500">Rate</span>
          <span className="font-bold text-rose-600">{formatPrice(consultant.hourlyRate)}/hr</span>
        </div>
      </div>

      {/* Contact fields — locked once OTP sent */}
      <div className={cn("space-y-3", phase !== "form" && "opacity-60 pointer-events-none")}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-rose-500" />
              Full Name <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="e.g. Ahmad Al-Rashidi"
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent",
              nameError ? "border-red-300 bg-red-50" : "border-gray-200"
            )}
          />
          {nameError && <p className="text-xs text-red-500 mt-1">Please enter your full name.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-rose-500" />
              Phone Number <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="e.g. +965 XXXX XXXX"
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent",
              phoneError ? "border-red-300 bg-red-50" : "border-gray-200"
            )}
          />
          {phoneError && <p className="text-xs text-red-500 mt-1">Please enter your phone number.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you'd like the consultant to know beforehand…"
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
          />
          <div className="text-right mt-1">
            <span className="text-xs text-gray-400">{notes.length}/500</span>
          </div>
        </div>
      </div>

      {/* OTP entry */}
      {phase === "otp" && (
        <div className="space-y-3">
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

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700">
                {sandboxCode
                  ? <>WhatsApp not configured — use the sandbox code above.</>
                  : <>A 6-digit code was sent to <span className="font-semibold">{phone}</span> via WhatsApp.</>
                }
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError("") }}
              placeholder="Enter 6-digit code"
              className={cn(
                "w-full rounded-lg border px-3 py-2.5 text-sm text-center tracking-[0.5em] font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent",
                otpError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              )}
            />
            {otpError && <p className="text-xs text-red-500">{otpError}</p>}

            <button
              onClick={sendOTP}
              disabled={sending}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={cn("h-3 w-3", sending && "animate-spin")} />
              {sending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {phase === "form" && (
        <Button
          onClick={sendOTP}
          disabled={sending}
          className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md disabled:opacity-60"
        >
          {sending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code…</>
          ) : (
            <><ShieldCheck className="mr-2 h-5 w-5" /> Send Verification Code</>
          )}
        </Button>
      )}

      {phase === "otp" && (
        <Button
          onClick={verifyOTP}
          disabled={verifying || otp.trim().length !== 6}
          className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md disabled:opacity-60"
        >
          {verifying ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
          ) : (
            <><CalendarCheck className="mr-2 h-5 w-5" /> Verify & Proceed to Payment</>
          )}
        </Button>
      )}

      {/* Step: Payment method selection */}
      {phase === "method" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-rose-500" /> Choose Payment Method
            </p>
            <button
              onClick={() => { setPhase("otp"); setPendingBookingId(null); setSelectedMethod(null) }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
          </div>

          {loadingMethods ? (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading payment methods…</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all",
                    selectedMethod?.id === method.id
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-rose-300 hover:bg-rose-50"
                  )}
                >
                  {method.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={method.imageUrl} alt={method.nameEn} className="h-7 object-contain" />
                  ) : (
                    <CreditCard className="h-7 w-7 text-gray-400" />
                  )}
                  <span>{method.nameEn}</span>
                </button>
              ))}
            </div>
          )}

          <Button
            onClick={proceedToPayment}
            disabled={!selectedMethod || loadingMethods}
            className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md disabled:opacity-60"
          >
            <CalendarCheck className="mr-2 h-5 w-5" />
            Pay {selectedMethod ? `with ${selectedMethod.nameEn}` : ""}
          </Button>
        </div>
      )}

      {phase === "paying" && (
        <Button
          disabled
          className="w-full h-11 bg-rose-500 text-white font-semibold shadow-md opacity-60"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting to payment…
        </Button>
      )}

      {phase === "otp" && (
        <button
          onClick={() => { setPhase("form"); setOtp(""); setOtpError("") }}
          className="w-full text-xs text-gray-400 hover:text-gray-600 text-center transition-colors"
        >
          ← Change phone number
        </button>
      )}
    </div>
  )
}
