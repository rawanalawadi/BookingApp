import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarCheck, Star, Clock, ShieldCheck } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-rose-50 via-rose-50 to-orange-50 overflow-hidden">
      {/* Blob decorations */}
      <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-[28rem] sm:h-[28rem] bg-gradient-to-br from-purple-300 via-rose-300 to-rose-300 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tr from-violet-400 to-purple-300 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-orange-200 to-rose-200 rounded-full blur-2xl opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-rose-100 shadow-sm px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 mb-6">
            <Star className="h-3.5 w-3.5 text-rose-500 fill-rose-500 shrink-0" />
            Book in under 2 minutes — no account needed
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-5">
            Expert Advice,{" "}
            <span className="text-rose-500">Booked</span>{" "}
            <span className="text-orange-500">Instantly</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
            Career coaching, financial planning, legal advisory, mental wellness — all in one place, on your schedule.
          </p>

          {/* CTA */}
          <Link href="/consultants" className="block sm:inline-block">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg sm:text-xl rounded-xl shadow-lg shadow-rose-200"
            >
              <CalendarCheck className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Book a Session
              <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </Link>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-rose-400" /> Secure payment
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-rose-400" /> Instant confirmation
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" /> No account required
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6 max-w-sm sm:max-w-xl mx-auto text-center">
          {[
            { label: "Expert Consultants", value: "50+" },
            { label: "Sessions Booked", value: "12K+" },
            { label: "Avg. Rating", value: "4.9★" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/60 backdrop-blur rounded-2xl py-3 sm:py-4 px-2 shadow-sm border border-white">
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
