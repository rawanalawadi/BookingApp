import NextAuth, { DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import bcrypt from "bcryptjs"
import { readFileSync } from "fs"
import path from "path"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      phone?: string
    } & DefaultSession["user"]
  }
}

interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
}

function getUsers(): StoredUser[] {
  try {
    const filePath = path.join(process.cwd(), "src/lib/users.json")
    const raw = readFileSync(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function checkIsAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  return !!adminEmail && !!email && email === adminEmail
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Apple,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" },
        phone: { label: "Phone", type: "text" },
        uid: { label: "UID", type: "text" },
      },
      async authorize(credentials): Promise<{ id: string; name: string | null; email: string | null; phone?: string } | null> {
        if (credentials?.type === "phone") {
          if (!credentials.phone || !credentials.uid) return null
          return {
            id: credentials.uid as string,
            name: null,
            email: null,
            phone: credentials.phone as string,
          }
        }
        if (!credentials?.email || !credentials?.password) return null
        const users = getUsers()
        const user = users.find((u) => u.email === credentials.email)
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = checkIsAdmin(user.email)
        if ("phone" in user && user.phone) token.phone = user.phone as string
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = (token.isAdmin as boolean) ?? false
        if (token.phone) session.user.phone = token.phone as string
      }
      return session
    },
  },
})
