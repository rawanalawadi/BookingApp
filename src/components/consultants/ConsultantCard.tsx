import Link from "next/link"
import Image from "next/image"
import { Star, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Consultant } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function ConsultantCard({ consultant }: { consultant: Consultant }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
      <CardContent className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-teal-100">
            <Image
              src={consultant.avatarUrl}
              alt={consultant.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate">{consultant.name}</h3>
            <Badge className="mt-1 bg-teal-50 text-teal-700 border-teal-200 text-xs font-medium">
              {consultant.specialty}
            </Badge>
          </div>
        </div>

        {/* Rating & rate */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-gray-800">{consultant.rating}</span>
            <span className="text-gray-400">({consultant.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-teal-500" />
            <span className="font-semibold text-gray-800">{formatCurrency(consultant.hourlyRate)}</span>
            <span className="text-gray-400">/hr</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {consultant.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
          {consultant.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
              +{consultant.tags.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <Link href={`/consultants/${consultant.id}`}>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
