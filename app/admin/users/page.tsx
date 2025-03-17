"use client"

interface User {
  id: string
  username: string
  name: string
  role: string
  lastLogin: string | null
  isActive: boolean
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">系統用戶</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">用戶列表</h3>
          <div className="mt-4">
            <p className="text-muted-foreground">系統用戶管理功能正在開發中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

