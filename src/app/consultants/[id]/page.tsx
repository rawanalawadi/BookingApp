import Image from "next/image"
import { notFound } from "next/navigation"
import { Star, Clock, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getConsultantById } from "@/lib/data"
import { getConsultantWithSchedule } from "@/lib/consultants-server"
import { formatCurrency } from "@/lib/utils"
import BookingPanel from "@/components/booking/BookingPanel"

interface Props {
  params: { id: string }
}

export default function ConsultantDetailPage({ params }: Props) {
  const consultant = getConsultantWithSchedule(params.id) ?? getConsultantById(params.id)
  if (!consultant) notFound()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8 items-start">
          {/* Left: Bio column */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-rose-100 flex-shrink-0">
                  <Image
                    src={consultant.avatarUrl}
                    alt={consultant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{consultant.name}</h1>
                  <Badge className="mt-1 mb-3 bg-rose-50 text-rose-600 border-rose-200">
                    {consultant.specialty}
                  </Badge>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-800">{consultant.rating}</span>
                      <span className="text-gray-400">({consultant.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-rose-500" />
                      <span className="font-semibold text-gray-800">{formatCurrency(consultant.hourlyRate)}</span>
                      <span className="text-gray-400">/ hour</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="font-bold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{consultant.bio}</p>
              </div>

              <div className="mt-6">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-rose-500" />
                  Specializations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {consultant.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking panel */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <BookingPanel consultant={consultant} />
          </div>
        </div>
      </div>
    </div>
  )
}
