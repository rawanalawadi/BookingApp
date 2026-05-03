import { Search, CalendarCheck, ClipboardList, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FEATURES = [
  {
    icon: Search,
    title: "Browse Verified Experts",
    description: "Filter consultants by specialty, availability, and pricing. Every expert is vetted and reviewed.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: CalendarCheck,
    title: "Book in Seconds",
    description: "Pick a date and time that works for you. Real-time availability — no back-and-forth emails.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ClipboardList,
    title: "Manage Your Sessions",
    description: "View upcoming and past bookings in one place. Reschedule or cancel with a single click.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Confidential",
    description: "Your sessions and data are fully private. We never share personal information with third parties.",
    color: "bg-emerald-50 text-emerald-600",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to get expert help
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Simple, fast, and professional — from discovery to booking in under a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
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
