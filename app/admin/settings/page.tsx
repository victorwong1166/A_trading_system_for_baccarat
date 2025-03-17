"use client"

interface SystemSetting {
  key: string
  value: string
  description: string
  type: "text" | "number" | "boolean" | "select"
  options?: { value: string; label: string }[]
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">系統設置</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">設置選項</h3>
          <div className="mt-4">
            <p className="text-muted-foreground">系統設置功能正在開發中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

