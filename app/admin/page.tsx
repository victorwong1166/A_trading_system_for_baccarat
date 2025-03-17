"use client"

import { useEffect, useState } from "react"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentTransactions } from "@/components/admin/recent-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    stats: any
    recentTransactions: any[]
  }>({
    stats: {
      memberCount: 0,
      transactionCount: 0,
      totalRevenue: "$0",
      todayTransactions: 0,
      todayRevenue: "$0",
      totalDebt: "$0",
    },
    recentTransactions: [],
  })

  // 獲取儀表板數據
  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/dashboard")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch dashboard data")
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      toast({
        title: "獲取數據失敗",
        description: error instanceof Error ? error.message : "無法載入儀表板數據，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
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
        <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="transactions">最近交易</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardStats stats={dashboardData.stats} />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>會員分佈</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">會員類型分佈圖表</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>交易趨勢</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">近期交易趨勢圖表</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>系統通知</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-sm font-medium">系統更新</p>
                    <p className="text-xs text-muted-foreground">系統將於今晚進行例行維護</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="text-sm font-medium">會員提醒</p>
                    <p className="text-xs text-muted-foreground">有 3 位會員結欠超過 30 天</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-sm font-medium">交易提醒</p>
                    <p className="text-xs text-muted-foreground">今日交易額已超過昨日總額</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <RecentTransactions transactions={dashboardData.recentTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

