import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarCheck } from "lucide-react"

export default function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-rose-600 to-orange-400 text-white py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
          Ready to talk to an expert?
        </h2>
        <p className="text-rose-100 text-base sm:text-lg mb-8">
          No account needed. Pick your expert, choose a slot, and you&apos;re done in two minutes.
        </p>
        <Link href="/consultants" className="block sm:inline-block">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-rose-600 hover:bg-rose-50 font-bold h-12 sm:h-13 px-8 sm:px-10 shadow-lg text-base"
          >
            <CalendarCheck className="mr-2 h-5 w-5" />
            Book a Session Now
          </Button>
        </Link>
      </div>
    </section>
  )
}
