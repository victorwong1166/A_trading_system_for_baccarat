"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react"

export default function CashBalanceDisplay() {
  const [cashData, setCashData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 加載現金餘額數據
  const loadCashData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cash?action=summary")
      const data = await response.json()

      if (data.success) {
        setCashData(data)
      } else {
        setError(data.error || "獲取現金數據失敗")
      }
    } catch (err) {
      setError("獲取現金數據時發生錯誤")
      console.error("獲取現金數據錯誤:", err)
    } finally {
      setLoading(false)
    }
  }

  // 初始加載
  useEffect(() => {
    loadCashData()

    // 每60秒刷新一次數據
    const interval = setInterval(loadCashData, 60000)
    return () => clearInterval(interval)
  }, [])

  // 格式化金額
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "0"
    return Number(amount).toLocaleString("zh-HK")
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">現金餘額</CardTitle>
          <Button variant="ghost" size="sm" onClick={loadCashData} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="text-3xl font-bold">${formatAmount(cashData?.balance)}</div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <ArrowUpCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>今日收入: ${formatAmount(cashData?.todayIn)}</span>
              </div>
              <div className="flex items-center">
                <ArrowDownCircle className="h-4 w-4 text-red-500 mr-1" />
                <span>今日支出: ${formatAmount(cashData?.todayOut)}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              今日交易: {cashData?.todayCount || 0} 筆
              {cashData?.latestTransaction && (
                <div className="mt-1">
                  最近交易: {new Date(cashData.latestTransaction.createdAt).toLocaleString("zh-HK")}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

