import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarCheck, Star } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            Trusted by 10,000+ professionals worldwide
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Expert Consultations,{" "}
            <span className="text-emerald-300">On Your Schedule</span>
          </h1>

          <p className="text-lg sm:text-xl text-teal-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified experts in career coaching, financial planning, mental wellness, legal advisory, and business strategy — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultants">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-teal-700 hover:bg-teal-50 font-semibold h-12 px-8 shadow-lg"
              >
                Browse Consultants
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/50 text-white hover:bg-white/10 h-12 px-8 bg-transparent"
              >
                <CalendarCheck className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto text-center">
          {[
            { label: "Expert Consultants", value: "50+" },
            { label: "Sessions Booked", value: "12K+" },
            { label: "Avg. Rating", value: "4.9★" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-teal-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
