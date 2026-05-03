import { redirect } from "next/navigation"
import { auth } from "@/auth"
import AdminSidebar from "@/components/admin/AdminSidebar"

export const metadata = {
  title: "Admin — ConsultEase",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/")

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
