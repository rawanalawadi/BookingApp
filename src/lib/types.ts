export interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export interface Consultant {
  id: string
  name: string
  specialty: string
  bio: string
  avatarUrl: string
  hourlyRate: number
  rating: number
  reviewCount: number
  availableSlots: Record<string, TimeSlot[]>
  tags: string[]
  offersOnline?: boolean
  offersInPerson?: boolean
}

export type SessionType = "online" | "in_person"

export type BookingStatus = "confirmed" | "cancelled" | "pending"

export interface Booking {
  id: string
  userEmail?: string
  consultantId: string
  consultantName: string
  consultantSpecialty: string
  consultantAvatarUrl: string
  date: string
  timeSlot: string
  sessionType: SessionType
  summary: string
  status: BookingStatus
  createdAt: string
  hourlyRate: number
  paymentReference?: string
}
