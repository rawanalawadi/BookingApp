"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "Registration failed. Please try again.")
      return
    }

    router.push("/auth/login?registered=1")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="bg-teal-600 p-3 rounded-xl">
              <CalendarCheck className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create your account</CardTitle>
          <CardDescription className="text-gray-500">Start booking expert consultations today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 border-gray-200 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-200 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 border-gray-200 focus-visible:ring-teal-500"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teal-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
