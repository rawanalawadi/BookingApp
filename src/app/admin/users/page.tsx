"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"

interface AdminUser {
  id: string
  name: string
  email: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">
          {loading ? "Loading…" : `${users.length} registered user${users.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No users registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name", "Email"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
                          {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
