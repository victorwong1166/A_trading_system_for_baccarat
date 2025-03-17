"use client"

import { useEffect, useState } from "react"
import { SystemSettings } from "@/components/admin/system-settings"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

interface SystemSetting {
  key: string
  value: string
  description: string
  type: "text" | "number" | "boolean" | "select"
  options?: { value: string; label: string }[]
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<SystemSetting[]>([])

  // 獲取系統設置
  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      toast({
        title: "獲取設置失敗",
        description: "無法載入系統設置，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // 處理設置更新
  const handleSettingUpdated = (key: string, value: string) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) => (setting.key === key ? { ...setting, value } : setting)),
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">系統設置</h1>
      </div>

      <SystemSettings settings={settings} onSettingUpdated={handleSettingUpdated} />
    </div>
  )
}

