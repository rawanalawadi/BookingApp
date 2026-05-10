export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

const MF_BASE_URL = process.env.MYFATOORAH_BASE_URL ?? "https://apitest.myfatoorah.com"
const MF_API_KEY  = process.env.MYFATOORAH_API_KEY  ?? ""

function isMFConfigured() {
  return MF_API_KEY.length > 0 && !MF_API_KEY.startsWith("your-")
}

export interface PaymentMethod {
  id: number
  nameEn: string
  nameAr: string
  code: string
  imageUrl: string
  totalAmount: number
  serviceCharge: number
  currencyIso: string
}

export async function POST(req: Request) {
  const { amount, currency } = await req.json().catch(() => ({}))

  if (!isMFConfigured()) {
    // Mock fallback — return a single mock method
    return NextResponse.json({
      methods: [{ id: -1, nameEn: "Mock Payment", nameAr: "دفع وهمي", code: "mock", imageUrl: "", totalAmount: amount ?? 0, serviceCharge: 0, currencyIso: currency ?? "KWD" }]
    })
  }

  const res = await fetch(`${MF_BASE_URL}/v2/InitiatePayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MF_API_KEY}`,
    },
    body: JSON.stringify({ InvoiceAmount: amount ?? 0, CurrencyIso: currency ?? "KWD" }),
    cache: "no-store",
  })

  const data = await res.json()
  if (!res.ok || !data.IsSuccess) {
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 502 })
  }

  const methods: PaymentMethod[] = (data.Data?.PaymentMethods ?? []).map((m: Record<string, unknown>) => ({
    id:            m.PaymentMethodId as number,
    nameEn:        m.PaymentMethodEn as string,
    nameAr:        m.PaymentMethodAr as string,
    code:          m.PaymentMethodCode as string,
    imageUrl:      m.ImageUrl as string,
    totalAmount:   m.TotalAmount as number,
    serviceCharge: m.ServiceCharge as number,
    currencyIso:   m.CurrencyIso as string,
  }))

  return NextResponse.json({ methods })
}
