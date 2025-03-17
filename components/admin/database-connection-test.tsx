"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
import { RefreshCwIcon as ReloadIcon, DatabaseIcon } from "lucide-react"

export default function DatabaseConnectionTest() {
  const [status, setStatus] = useState<{
    connected: boolean
    timestamp?: string
    connectionString?: string
    error?: string
    missingEnvVars?: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbStats, setDbStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 5;")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isExecutingQuery, setIsExecutingQuery] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [tableSchema, setTableSchema] = useState<any>(null)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/database/test")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : "未知錯誤",
      })
    } finally {
      setLoading(false)
    }
  }

  // 獲取數據庫統計信息
  const fetchDatabaseStats = async () => {
    setIsLoadingStats(true)

    try {
      const response = await fetch("/api/database/stats")
      const result = await response.json()

      if (result.success) {
        setDbStats(result)
      } else {
        toast({
          title: "獲取統計信息失敗",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching database stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // 執行SQL查詢
  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "查詢為空",
        description: "請輸入SQL查詢語句",
        variant: "destructive",
      })
      return
    }

    setIsExecutingQuery(true)
    setQueryResult(null)

    try {
      const response = await fetch("/api/database/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sqlQuery }),
      })

      const result = await response.json()

      if (result.success) {
        setQueryResult(result)
        toast({
          title: "查詢執行成功",
          description: `查詢已成功執行，耗時 ${result.duration}`,
        })
      } else {
        setQueryResult({ success: false, error: result.error })
        toast({
          title: "查詢執行失敗",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing query:", error)
      setQueryResult({
        success: false,
        error: error instanceof Error ? error.message : "未知錯誤",
      })
    } finally {
      setIsExecutingQuery(false)
    }
  }

  // 獲取表結構信息
  const fetchTableSchema = async (tableName: string) => {
    if (!tableName) return

    setIsLoadingSchema(true)
    setTableSchema(null)

    try {
      const response = await fetch(`/api/database/table-schema?table=${tableName}`)
      const result = await response.json()

      if (result.success) {
        setTableSchema(result)
      } else {
        toast({
          title: "獲取表結構失敗",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching table schema:", error)
    } finally {
      setIsLoadingSchema(false)
    }
  }

  // 初始檢查連接
  useEffect(() => {
    testConnection()
  }, [])

  // 當連接成功時獲取數據庫統計信息
  useEffect(() => {
    if (status?.connected) {
      fetchDatabaseStats()
    }
  }, [status?.connected])

  // 當選擇表格時獲取表結構
  useEffect(() => {
    if (selectedTable) {
      fetchTableSchema(selectedTable)
    }
  }, [selectedTable])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            數據庫連接狀態
          </CardTitle>
          <CardDescription>檢查系統與數據庫的連接狀態</CardDescription>
        </CardHeader>
        <CardContent>
          {status === null ? (
            <div className="flex justify-center py-6">
              <ReloadIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : status.connected ? (
            <div className="space-y-4">
              <Alert variant="default" className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>連接成功</AlertTitle>
                <AlertDescription>數據庫連接正常，系統可以正常運行。</AlertDescription>
              </Alert>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">連接時間</span>
                  <span className="text-sm">{status.timestamp}</span>
                </div>
                {status.connectionString && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">連接字符串</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {status.connectionString}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>連接失敗</AlertTitle>
                <AlertDescription>
                  {status.missingEnvVars
                    ? "未找到數據庫連接字符串。請確保設置了必要的環境變量。"
                    : `無法連接到數據庫: ${status.error || "未知錯誤"}`}
                </AlertDescription>
              </Alert>

              {status.missingEnvVars && (
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">環境變量設置指南</h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        <p>請確保設置了以下環境變量之一:</p>
                        <ul className="list-disc space-y-1 pl-5 mt-1">
                          <li>DATABASE_URL</li>
                          <li>POSTGRES_URL</li>
                          <li>POSTGRES_PRISMA_URL</li>
                          <li>POSTGRES_URL_NON_POOLING</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={loading} variant="outline" className="w-full">
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "測試中..." : "重新測試連接"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

