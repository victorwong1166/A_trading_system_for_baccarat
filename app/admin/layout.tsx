import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  // 檢查用戶是否已登入且具有管理員權限
  if (!session || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin")
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* 側邊欄 */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold">後台管理系統</h1>
          </div>
          <div className="flex-grow px-4 mt-5">
            <AdminNav />
          </div>
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.role === "admin" ? "系統管理員" : "用戶"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主內容區 */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

