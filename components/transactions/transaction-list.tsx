"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionFilter } from "./transaction-filter"
import {
  getTransactionTypeName,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  getTransactionCategoryName,
} from "@/lib/transaction-types"
import { MoreHorizontal, Eye, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  transactionId: string
  memberId: string
  memberName: string
  amount: number
  type: string
  status: string
  description: string
  createdAt: string
  balanceBefore?: number
  balanceAfter?: number
}

interface TransactionListProps {
  category?: string
}

export function TransactionList({ category }: TransactionListProps) {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<any>(category ? { category } : {})
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", "10")

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === "startDate" || key === "endDate") {
            queryParams.append(key, new Date(value as string).toISOString())
          } else {
            queryParams.append(key, value as string)
          }
        }
      })

      const response = await fetch(`/api/transactions?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.totalCount || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (category) {
      setFilters((prev) => ({ ...prev, category }))
    }
  }, [category])

  useEffect(() => {
    fetchTransactions()
  }, [page, filters])

  const handleFilter = (newFilters: any) => {
    // Preserve the category filter if it's set from props
    const updatedFilters = category ? { ...newFilters, category } : newFilters

    setFilters(updatedFilters)
    setPage(1)
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsOpen(true)
  }

  const handleCancelTransaction = async () => {
    if (!selectedTransaction) return

    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancelReason }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel transaction")
      }

      // Refresh transactions
      fetchTransactions()
      setIsCancelDialogOpen(false)
      setCancelReason("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const TypeIcon = selectedTransaction ? getTransactionTypeIcon(selectedTransaction.type) : null

  return (
    <div className="space-y-4">
      <TransactionFilter onFilter={handleFilter} initialCategory={category} />

      <Card>
        <CardHeader>
          <CardTitle>交易記錄</CardTitle>
          <CardDescription>共 {totalCount} 筆交易記錄</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>載入中...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-red-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>沒有交易記錄</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>交易編號</TableHead>
                      <TableHead>會員</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>時間</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const TransactionIcon = getTransactionTypeIcon(transaction.type)
                      const typeColor = getTransactionTypeColor(transaction.type)

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                          <TableCell>{transaction.memberName}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <TransactionIcon className={`mr-1 h-4 w-4 ${typeColor}`} />
                              <span>{getTransactionTypeName(transaction.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === "active" ? "default" : "destructive"}>
                              {transaction.status === "active" ? "有效" : "已取消"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleString("zh-TW", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">操作</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  查看詳情
                                </DropdownMenuItem>
                                {transaction.status === "active" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedTransaction(transaction)
                                      setIsCancelDialogOpen(true)
                                    }}
                                    className="text-red-500"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    取消交易
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  顯示第 {(page - 1) * 10 + 1} 至 {Math.min(page * 10, totalCount)} 筆，共 {totalCount} 筆
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    上一頁
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    下一頁
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 交易詳情對話框 */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>交易詳情</DialogTitle>
            <DialogDescription>交易編號: {selectedTransaction?.transactionId}</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {TypeIcon && (
                    <TypeIcon className={`mr-2 h-5 w-5 ${getTransactionTypeColor(selectedTransaction.type)}`} />
                  )}
                  <span className="font-medium">{getTransactionTypeName(selectedTransaction.type)}</span>
                </div>
                <Badge variant={selectedTransaction.status === "active" ? "default" : "destructive"}>
                  {selectedTransaction.status === "active" ? "有效" : "已取消"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">會員</p>
                  <p>{selectedTransaction.memberName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">金額</p>
                  <p className="font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">類別</p>
                  <p>{getTransactionCategoryName(selectedTransaction.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">時間</p>
                  <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                {selectedTransaction.balanceBefore !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">交易前餘額</p>
                    <p>{formatCurrency(selectedTransaction.balanceBefore)}</p>
                  </div>
                )}
                {selectedTransaction.balanceAfter !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">交易後餘額</p>
                    <p>{formatCurrency(selectedTransaction.balanceAfter)}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.description && (
                <div>
                  <p className="text-sm text-muted-foreground">備註</p>
                  <p>{selectedTransaction.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 取消交易對話框 */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消交易</DialogTitle>
            <DialogDescription>確定要取消這筆交易嗎？此操作無法撤銷。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-sm font-medium">
                取消原因
              </label>
              <textarea
                id="cancelReason"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="請輸入取消原因"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleCancelTransaction}>
              確認取消交易
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

