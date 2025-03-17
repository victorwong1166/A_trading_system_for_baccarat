"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react"

export default function CashTransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const limit = 10

  // 加載交易歷史
  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cash?action=history&limit=${limit}&offset=${page * limit}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.transactions)
      } else {
        setError(data.error || "獲取交易歷史失敗")
      }
    } catch (err) {
      setError("獲取交易歷史時發生錯誤")
      console.error("獲取交易歷史錯誤:", err)
    } finally {
      setLoading(false)
    }
  }

  // 初始加載
  useEffect(() => {
    loadTransactions()
  }, [page])

  // 格式化金額
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "0"
    return Number(amount).toLocaleString("zh-HK")
  }

  // 獲取交易類型顯示名稱
  const getTransactionTypeName = (type) => {
    const typeMap = {
      buy_chips: "買碼",
      redeem_chips: "兌碼",
      manual: "手動調整",
      transfer: "轉賬",
      settlement: "結算",
    }
    return typeMap[type] || type
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">現金交易歷史</CardTitle>
          <Button variant="ghost" size="sm" onClick={loadTransactions} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>餘額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      暫無交易記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs">{new Date(tx.createdAt).toLocaleString("zh-HK")}</TableCell>
                      <TableCell>{getTransactionTypeName(tx.type)}</TableCell>
                      <TableCell className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                        <div className="flex items-center">
                          {tx.amount >= 0 ? (
                            <ArrowUpCircle className="h-3 w-3 mr-1 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3 mr-1 text-red-500" />
                          )}
                          ${formatAmount(Math.abs(tx.amount))}
                        </div>
                      </TableCell>
                      <TableCell>${formatAmount(tx.balanceAfter)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                上一頁
              </Button>
              <span className="text-sm py-2">第 {page + 1} 頁</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={transactions.length < limit}
              >
                下一頁
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

