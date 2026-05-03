import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import ConditionalLayout from "@/components/layout/ConditionalLayout"
import { auth } from "@/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ConsultEase — Expert Consultations, On Your Schedule",
  description: "Book one-on-one sessions with top consultants in career coaching, financial planning, mental wellness, legal advisory, and business strategy.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        <SessionProvider session={session}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster richColors position="top-center" />
        </SessionProvider>
      </body>
    </html>
  )
}
