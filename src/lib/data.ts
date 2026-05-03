import { addDays, format } from "date-fns"
import { Consultant, TimeSlot } from "./types"

const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

function generateSlots(daysAhead: number): Record<string, TimeSlot[]> {
  const slots: Record<string, TimeSlot[]> = {}
  const today = new Date()

  for (let i = 1; i <= daysAhead; i++) {
    const date = addDays(today, i)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    const key = format(date, "yyyy-MM-dd")
    slots[key] = TIMES.map((time) => ({
      id: `${key}-${time}`,
      time,
      available: true,
    }))
  }

  return slots
}

export const CONSULTANTS: Consultant[] = [
  {
    id: "sarah-chen",
    name: "Dr. Sarah Chen",
    specialty: "Career Coaching",
    bio: "With over 12 years of experience guiding professionals through career transitions, I specialize in helping tech leaders and aspiring executives find their path. My approach combines evidence-based coaching with practical strategies tailored to the fast-moving tech industry.",
    avatarUrl: "https://ui-avatars.com/api/?name=Sarah+Chen&background=0d9488&color=fff&size=200",
    hourlyRate: 120,
    rating: 4.9,
    reviewCount: 247,
    tags: ["Leadership", "Tech Careers", "Resume", "Interview Prep"],
    offersOnline: true,
    offersInPerson: true,
    availableSlots: generateSlots(30),
  },
  {
    id: "marcus-webb",
    name: "Marcus Webb",
    specialty: "Financial Planning",
    bio: "Certified Financial Planner with 15+ years helping individuals and families build lasting wealth. I focus on personalized strategies covering investment portfolios, retirement planning, and tax optimization — cutting through financial jargon to make your money work smarter.",
    avatarUrl: "https://ui-avatars.com/api/?name=Marcus+Webb&background=059669&color=fff&size=200",
    hourlyRate: 150,
    rating: 4.8,
    reviewCount: 183,
    tags: ["Investments", "Retirement", "Budgeting", "Tax Planning"],
    offersOnline: true,
    offersInPerson: false,
    availableSlots: generateSlots(30),
  },
  {
    id: "aisha-okafor",
    name: "Dr. Aisha Okafor",
    specialty: "Mental Wellness",
    bio: "Licensed therapist and mindfulness coach specializing in anxiety, burnout, and work-life balance for high-performing professionals. I create a safe, non-judgmental space to help you develop resilience, clarity, and healthier patterns that sustain long-term wellbeing.",
    avatarUrl: "https://ui-avatars.com/api/?name=Aisha+Okafor&background=14b8a6&color=fff&size=200",
    hourlyRate: 95,
    rating: 5.0,
    reviewCount: 312,
    tags: ["Anxiety", "Work-Life Balance", "Mindfulness", "Burnout"],
    offersOnline: true,
    offersInPerson: true,
    availableSlots: generateSlots(30),
  },
  {
    id: "james-thornton",
    name: "James Thornton",
    specialty: "Legal Advisory",
    bio: "Startup and business attorney with 18 years of experience across Silicon Valley and New York. I advise founders on entity formation, contracts, intellectual property, and fundraising agreements — giving early-stage companies the legal clarity to grow confidently.",
    avatarUrl: "https://ui-avatars.com/api/?name=James+Thornton&background=0f766e&color=fff&size=200",
    hourlyRate: 200,
    rating: 4.7,
    reviewCount: 98,
    tags: ["Contracts", "Startups", "IP", "Fundraising"],
    offersOnline: true,
    offersInPerson: false,
    availableSlots: generateSlots(30),
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    specialty: "Business Strategy",
    bio: "Former McKinsey consultant turned startup advisor. I help founders and SMB owners sharpen their go-to-market strategy, unlock new revenue streams, and build operationally efficient teams. I've worked with 60+ companies across SaaS, e-commerce, and fintech.",
    avatarUrl: "https://ui-avatars.com/api/?name=Priya+Nair&background=10b981&color=fff&size=200",
    hourlyRate: 175,
    rating: 4.9,
    reviewCount: 156,
    tags: ["Growth", "Marketing", "Go-to-Market", "SaaS"],
    offersOnline: true,
    offersInPerson: true,
    availableSlots: generateSlots(30),
  },
]

export const SPECIALTIES = ["All", ...Array.from(new Set(CONSULTANTS.map((c) => c.specialty)))]

export function getConsultantById(id: string): Consultant | undefined {
  return CONSULTANTS.find((c) => c.id === id)
}
