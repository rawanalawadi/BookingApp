import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to get expert guidance?
        </h2>
        <p className="text-teal-100 text-lg mb-10">
          Browse our consultants and book your first session today — no commitment required.
        </p>
        <Link href="/consultants">
          <Button
            size="lg"
            className="bg-white text-teal-700 hover:bg-teal-50 font-semibold h-12 px-10 shadow-lg"
          >
            Browse Consultants
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
