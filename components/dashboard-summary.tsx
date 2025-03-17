"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardSummaryProps {
  onDebtClick?: () => void
}

export default function DashboardSummary({ onDebtClick }: DashboardSummaryProps) {
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    pendingPayments: 0,
    todayTransactions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch("/api/dashboard-summary")
        if (!response.ok) {
          throw new Error("Failed to fetch summary data")
        }
        const data = await response.json()

        if (data && data.summary) {
          setSummary(data.summary)
        }
      } catch (error) {
        console.error("Error fetching summary:", error)
        // 使用模擬數據作為後備
        setSummary({
          totalTransactions: 125,
          totalAmount: 25000,
          pendingPayments: 3500,
          todayTransactions: 12,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">加載中...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">總交易數</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalTransactions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">總交易金額</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.totalAmount.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer" onClick={onDebtClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">待付款項</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.pendingPayments.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今日交易</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.todayTransactions}</div>
        </CardContent>
      </Card>
    </div>
  )
}

