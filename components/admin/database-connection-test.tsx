"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Database, AlertCircle, CheckCircle, XCircle, RefreshCw, Table, FileText, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
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
      toast({
        title: "獲取統計信息失敗",
        description: error.message,
        variant: "destructive",
      })
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
      setQueryResult({ success: false, error: error.message })
      toast({
        title: "查詢執行失敗",
        description: error.message,
        variant: "destructive",
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
      toast({
        title: "獲取表結構失敗",
        description: error.message,
        variant: "destructive",
      })
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
                <AlertDescription>
                  數據庫連接正常，系統可以正常運行。
                </AlertDescription>
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
          <Button 
            onClick={testConnection} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "測試中..." : "重新測試連接"}
          </Button>
        </CardFooter>
      </Card>
      <Tabs defaultValue="stats">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">數據庫統計</TabsTrigger>
          <TabsTrigger value="query">SQL查詢</TabsTrigger>
          <TabsTrigger value="schema">表結構</TabsTrigger>
        </TabsList>

        {/* 數據庫統計 */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-green-500" />
                數據庫統計信息
              </CardTitle>
              <CardDescription>查看數據庫的統計信息和表格數據</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingStats ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : dbStats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md bg-slate-50 p-4">
                      <div className="flex items-center">
                        <Table className="h-5 w-5 text-blue-500 mr-2" />
                        <div className="text-lg font-medium">{dbStats.tableCount}</div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">表格數量</div>
                    </div>
                    <div className="rounded-md bg-slate-50 p-4">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 text-green-500 mr-2" />
                        <div className="text-lg font-medium">{dbStats.dbSize}</div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">數據庫大小</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">表格列表</h4>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">表名</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">列數</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dbStats.tables.map((table, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedTable(table.table_name)}
                            >
                              <td className="px-4 py-2 text-sm">{table.table_name}</td>
                              <td className="px-4 py-2 text-sm">{table.column_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {dbStats.recentQueries && dbStats.recentQueries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">最近的查詢</h4>
                      <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">查詢</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                調用次數
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                總執行時間
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">行數</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dbStats.recentQueries.map((query, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm font-mono truncate max-w-xs">{query.query}</td>
                                <td className="px-4 py-2 text-sm">{query.calls}</td>
                                <td className="px-4 py-2 text-sm">{query.total_exec_time.toFixed(2)}ms</td>
                                <td className="px-4 py-2 text-sm">{query.rows}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">無法獲取數據庫統計信息</p>
                  <Button onClick={fetchDatabaseStats} className="mt-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重試
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={fetchDatabaseStats} disabled={isLoadingStats}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingStats ? "animate-spin" : ""}`} />
                {isLoadingStats ? "加載中..." : "刷新統計信息"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SQL查詢 */}
        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                SQL查詢執行
              </CardTitle>
              <CardDescription>執行自定義SQL查詢並查看結果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>注意</AlertTitle>
                <AlertDescription>
                  請謹慎執行SQL查詢，特別是修改或刪除數據的操作。建議在執行前備份數據庫。
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Textarea
                  placeholder="輸入SQL查詢..."
                  className="font-mono text-sm h-40"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                />
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button onClick={() => setSqlQuery("SELECT * FROM users LIMIT 5;")} variant="outline" size="sm">
                      用戶示例
                    </Button>
                    <Button onClick={() => setSqlQuery("SELECT * FROM members LIMIT 5;")} variant="outline" size="sm">
                      會員示例
                    </Button>
                    <Button
                      onClick={() => setSqlQuery("SELECT * FROM transactions LIMIT 5;")}
                      variant="outline"
                      size="sm"
                    >
                      交易示例
                    </Button>
                  </div>
                  <Button
                    onClick={handleExecuteQuery}
                    disabled={isExecutingQuery || !sqlQuery.trim() || !status?.connected}
                  >
                    {isExecutingQuery ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        執行中...
                      </>
                    ) : (
                      <>執行查詢</>
                    )}
                  </Button>
                </div>
              </div>

              {isExecutingQuery && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              )}

              {queryResult && (
                <div className="rounded-md border p-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">查詢結果</h4>
                    {queryResult.success && (
                      <div className="text-sm text-gray-500">
                        {queryResult.data ? <>返回 {queryResult.rowCount} 行</> : <>影響 {queryResult.rowCount} 行</>}
                        <span className="ml-2">耗時: {queryResult.duration}</span>
                      </div>
                    )}
                  </div>

                  {queryResult.success ? (
                    <div>
                      {queryResult.data && queryResult.data.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(queryResult.data[0]).map((key) => (
                                  <th
                                    key={key}
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {queryResult.data.map((row, i) => (
                                <tr key={i}>
                                  {Object.values(row).map((value, j) => (
                                    <td key={j} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {value === null ? <span className="text-gray-400">NULL</span> : String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-sm text-green-600 font-medium">查詢執行成功，無返回數據</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-500 text-sm">錯誤: {queryResult.error}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 表結構 */}
        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="mr-2 h-5 w-5 text-blue-500" />
                數據庫表結構
              </CardTitle>
              <CardDescription>查看數據庫表的結構信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex space-x-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                  >
                    <option value="">選擇表格</option>
                    {dbStats?.tables?.map((table, index) => (
                      <option key={index} value={table.table_name}>
                        {table.table_name}
                      </option>
                    ))}
                  </select>
                  <Button onClick={() => fetchTableSchema(selectedTable)} disabled={!selectedTable || isLoadingSchema}>
                    {isLoadingSchema ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        加載中...
                      </>
                    ) : (
                      <>查看結構</>
                    )}
                  </Button>
                </div>

                {isLoadingSchema ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : tableSchema ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="bg-slate-50 px-4 py-2 font-medium border-b">{selectedTable} - 列信息</div>
                      <div className="p-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">列名</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                數據類型
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">可空</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">默認值</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {tableSchema.columns.map((column, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm font-medium">{column.column_name}</td>
                                <td className="px-4 py-2 text-sm">
                                  {column.data_type}
                                  {column.character_maximum_length ? `(${column.character_maximum_length})` : ""}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {column.is_nullable === "YES" ? (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                      可空
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                      非空
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm font-mono">
                                  {column.column_default || <span className="text-gray-400">無</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="bg-slate-50 px-4 py-2 font-medium border-b">{selectedTable} - 約束信息</div>
                    <div className="p-4">
                      {tableSchema.constraints.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                約束名
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">類型</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">列名</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                引用表\
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                引用列
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {tableSchema.constraints.map((constraint, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm">{constraint.constraint_name}</td>
                                <td className="px-4 py-2 text-sm">
                                  {constraint.constraint_type === "PRIMARY KEY" && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                      主鍵
                                    </Badge>
                                  )}
                                  {constraint.constraint_type === "FOREIGN KEY" && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                      外鍵
                                    </Badge>
                                  )}
                                  {constraint.constraint_type === "UNIQUE" && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                      唯一
                                    </Badge>
                                  )}
                                  {constraint.constraint_type === "CHECK" && (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                      檢查
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm">{constraint.column_name}</td>
                                <td className="px-4 py-2 text-sm">
                                  {constraint.foreign_table_name || <span className="text-gray-400">-</span>}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {constraint.foreign_column_name || <span className="text-gray-400">-</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-4 text-gray-500">無約束信息</div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <Clock className="inline-block mr-1 h-4 w-4" />
                    表結構信息獲取時間: {new Date().toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {selectedTable ? <p>加載表結構信息中...</p> : <p>請選擇一個表格查看其結構</p>}
                </div>
              )}
            </CardContent>
        </TabsContent>
      </Tabs>
  </div>
  )
}

