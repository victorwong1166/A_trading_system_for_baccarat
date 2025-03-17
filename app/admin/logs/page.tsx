"use client"

import { useEffect, useState } from "react"
import { SystemLogs } from "@/components/admin/system-logs"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

interface SystemLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
}

export default function AdminLogsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<SystemLog[]>([])

  // 獲取系統日誌
  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/logs")
      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      toast({
        title: "獲取日誌失敗",
        description: "無法載入系統日誌，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

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
        <h1 className="text-3xl font-bold tracking-tight">系統日誌</h1>
      </div>

      <SystemLogs logs={logs} onRefresh={fetchLogs} />
    </div>
  )
}

