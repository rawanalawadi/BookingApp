import { Badge } from "@/components/ui/badge"
import { BookingStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-200",
  },
}

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={cn("font-medium text-xs border", config.className)}>
      {config.label}
    </Badge>
  )
}
