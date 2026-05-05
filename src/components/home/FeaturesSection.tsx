import { Search, CalendarCheck, Mail, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FEATURES = [
  {
    icon: Search,
    title: "Browse Verified Experts",
    description: "Filter by specialty, availability, and price. Every consultant is vetted — real credentials, real reviews.",
    color: "bg-rose-50 text-rose-500",
  },
  {
    icon: CalendarCheck,
    title: "Book in 2 Minutes",
    description: "Pick a date, choose a time slot, enter your name and phone. No account, no password, no friction.",
    color: "bg-orange-50 text-orange-500",
  },
  {
    icon: ShieldCheck,
    title: "Pay Securely",
    description: "Checkout powered by MyFatoorah. Your payment is encrypted and processed safely every time.",
    color: "bg-rose-50 text-rose-500",
  },
  {
    icon: Mail,
    title: "Instant Confirmation",
    description: "Get your booking reference and all session details sent straight to your phone or email. No surprises.",
    color: "bg-orange-50 text-orange-500",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-8 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 md:mb-14">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1.5">
            From browse to booked in minutes
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg max-w-xl mx-auto">
            No sign-up, no back-and-forth. Just pick, pay, and show up.
          </p>
        </div>

        {/* Mobile: compact horizontal rows. sm+: centered cards */}
        <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="sm:hidden flex items-start gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
              <div className={`shrink-0 p-2 rounded-lg ${feature.color}`}>
                <feature.icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.description}</p>
              </div>
            </div>
          ))}
          {FEATURES.map((feature) => (
            <Card key={`card-${feature.title}`} className="hidden sm:block border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-5`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
