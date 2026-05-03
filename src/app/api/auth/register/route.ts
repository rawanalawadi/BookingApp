import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { readFileSync, writeFileSync } from "fs"
import path from "path"

interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
}

function getUsersFilePath(): string {
  return path.join(process.cwd(), "src/lib/users.json")
}

function getUsers(): StoredUser[] {
  try {
    const raw = readFileSync(getUsersFilePath(), "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]): void {
  writeFileSync(getUsersFilePath(), JSON.stringify(users, null, 2))
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    const users = getUsers()
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
    }

    users.push(newUser)
    saveUsers(users)

    return NextResponse.json({ message: "Account created successfully." }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
