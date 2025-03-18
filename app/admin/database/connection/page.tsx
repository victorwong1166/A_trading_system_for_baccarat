"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Database, RefreshCw, Server } from "lucide-react"
import { useSession } from "next-auth/react"

export default function DatabaseConnectionPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [tables, setTables] = useState<string[]>([])
  const [forceRebuild, setForceRebuild] = useState(false)
  const [seedData, setSeedData] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/db-test?action=test")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: "連接測試失敗",
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const getTables = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/db-test?action=tables")
      const data = await response.json()
      if (data.success) {
        setTables(data.tables)
      }
    } catch (error) {
      console.error("獲取表結構失敗:", error)
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/db-test?action=init&force=${forceRebuild}`)
      const data = await response.json()
      setTestResult(data)

      if (data.success && seedData) {
        const seedResponse = await fetch("/api/db-test?action=seed")
        const seedResult = await seedResponse.json()
        setTestResult({
          ...data,
          seedResult,
        })
      }

      // 重新獲取表結構
      await getTables()
    } catch (error) {
      setTestResult({
        success: false,
        message: "初始化數據庫失敗",
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 初始加載時獲取表結構
    getTables()
  }, [])

  if (!session || session.user.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>權限錯誤</AlertTitle>
        <AlertDescription>您沒有權限訪問此頁面。只有管理員可以訪問數據庫管理功能。</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">數據庫連接</h1>
      </div>

      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connection">連接測試</TabsTrigger>
          <TabsTrigger value="structure">表結構</TabsTrigger>
          <TabsTrigger value="initialize">初始化數據庫</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>數據庫連接測試</CardTitle>
              <CardDescription>測試與數據庫的連接是否正常。這將嘗試連接到配置的數據庫並執行簡單查詢。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Server className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">PostgreSQL 數據庫</p>
                  <p className="text-sm text-muted-foreground">使用環境變量中配置的連接字符串</p>
                </div>
              </div>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{testResult.success ? "連接成功" : "連接失敗"}</AlertTitle>
                  <AlertDescription>
                    {testResult.message}
                    {testResult.data && (
                      <div className="mt-2">
                        <p>數據庫: {testResult.data.database}</p>
                        <p>時間: {testResult.data.time}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={testConnection} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    測試中...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    測試連接
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>數據庫表結構</CardTitle>
              <CardDescription>查看當前數據庫中的表結構。這將顯示所有表的列表。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={getTables} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      刷新中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      刷新
                    </>
                  )}
                </Button>
              </div>

              {tables.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">表列表</h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {tables.map((table) => (
                      <div key={table} className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center">
                          <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{table}</span>
                        </div>
                        <Badge variant="outline">表</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>沒有找到表</AlertTitle>
                  <AlertDescription>數據庫中沒有找到任何表。您可能需要初始化數據庫。</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="initialize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>初始化數據庫</CardTitle>
              <CardDescription>初始化數據庫結構。這將創建所有必要的表和初始數據。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>警告</AlertTitle>
                <AlertDescription>初始化數據庫可能會導致數據丟失。請確保您已經備份了重要數據。</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="force-rebuild"
                    checked={forceRebuild}
                    onCheckedChange={(checked) => setForceRebuild(!!checked)}
                  />
                  <Label htmlFor="force-rebuild" className="font-medium text-red-500">
                    強制重建（將刪除現有表）
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="seed-data" checked={seedData} onCheckedChange={(checked) => setSeedData(!!checked)} />
                  <Label htmlFor="seed-data">填充示例數據</Label>
                </div>
              </div>

              <Separator />

              {testResult && testResult.success && (
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>初始化成功</AlertTitle>
                  <AlertDescription>
                    {testResult.message}
                    {testResult.seedResult && (
                      <div className="mt-2">
                        <p>示例數據: {testResult.seedResult.message}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {testResult && !testResult.success && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>初始化失敗</AlertTitle>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant={forceRebuild ? "destructive" : "default"}
                onClick={initializeDatabase}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    初始化中...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    {forceRebuild ? "強制重建數據庫" : "初始化數據庫"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

