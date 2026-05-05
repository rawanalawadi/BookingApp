import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const protectedRoutes = ["/my-bookings"]
  const isProtected = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route))

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    const isAdmin = (session as { user?: { isAdmin?: boolean } })?.user?.isAdmin
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/my-bookings/:path*", "/admin/:path*"],
}
