"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Share2, Calendar, Ban, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getTransactionTypeName, getTransactionTypeIcon, getTransactionTypeColor } from "@/lib/transaction-types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

// 交易類型定義
const transactionTypeFilters = [
  { id: "all", name: "全部" },
  { id: "buy", name: "買碼" },
  { id: "redeem", name: "兌碼" },
  { id: "sign_table", name: "簽碼表" },
  { id: "deposit_withdrawal", name: "存取明細" },
  { id: "labor", name: "人工" },
  { id: "misc", name: "雜費" },
  { id: "accounting", name: "帳房" },
  { id: "capital", name: "本金" },
  { id: "project", name: "項目" },
  { id: "transfer", name: "轉帳" },
]

// 修改交易類型過濾器，移除帳房和本金選項
// 將原始的 transactionTypeFilters 保留，但在顯示時過濾掉帳房和本金

// 在 transactionTypeFilters 定義後添加以下代碼
const visibleTransactionTypeFilters = transactionTypeFilters.filter(
  (type) => type.id !== "accounting" && type.id !== "capital",
)

// 模擬交易數據 - 增加交易類型
const transactionData = [
  {
    date: new Date().toISOString().split("T")[0], // 今天的日期
    transactions: [
      { id: "TR-001", memberId: "M001", memberName: "友短", amount: 5000, type: "buy", status: "active" },
      { id: "TR-002", memberId: "M002", memberName: "大雄", amount: 10000, type: "buy", status: "active" },
      {
        id: "TR-003",
        memberId: "M003",
        memberName: "大雄(林林)",
        amount: 10000,
        type: "sign",
        project: "A項目",
        status: "active",
      },
      {
        id: "TR-004",
        memberId: "",
        memberName: "",
        amount: 20000,
        type: "transfer",
        project: "存款轉至帳房",
        description: "資金轉移",
        status: "active",
      },
    ],
  },
  {
    date: "2023-05-14",
    transactions: [
      {
        id: "TR-005",
        memberId: "M004",
        memberName: "大雄(花姐)",
        amount: 10000,
        type: "sign",
        status: "canceled",
        cancelReason: "記錄錯誤",
      },
      { id: "TR-006", memberId: "M005", memberName: "點", amount: 5000, type: "buy", status: "active" },
      { id: "TR-007", memberId: "M006", memberName: "英", amount: 5000, type: "buy", status: "active" },
      { id: "TR-008", memberId: "M007", memberName: "華姐", amount: 5000, type: "buy", status: "active" },
    ],
  },
  {
    date: "2023-05-13",
    transactions: [
      { id: "TR-009", memberId: "M001", memberName: "友短", amount: -5000, type: "return", status: "active" },
      {
        id: "TR-010",
        memberId: "M002",
        memberName: "大雄",
        amount: 5000,
        type: "buy",
        status: "canceled",
        cancelReason: "客戶要求取消",
      },
      {
        id: "TR-011",
        memberId: "M003",
        memberName: "大雄(林林)",
        amount: 10000,
        type: "sign",
        project: "B項目",
        status: "active",
      },
      { id: "TR-012", memberId: "M005", memberName: "點", amount: 5000, type: "buy", status: "active" },
      { id: "TR-013", memberId: "M006", memberName: "英", amount: -5000, type: "return", status: "active" },
      { id: "TR-014", memberId: "M007", memberName: "華姐", amount: -5000, type: "return", status: "active" },
      {
        id: "TR-015",
        memberId: "",
        memberName: "",
        amount: 15000,
        type: "transfer",
        project: "帳房轉至存款",
        description: "資金轉移",
        status: "active",
      },
    ],
  },
  {
    date: "2023-05-12",
    transactions: [
      {
        id: "TR-016",
        memberId: "M003",
        memberName: "大雄(林林)",
        amount: 10000,
        type: "sign",
        project: "A項目",
        status: "active",
      },
      { id: "TR-017", memberId: "M005", memberName: "點", amount: 10000, type: "deposit", status: "active" },
      { id: "TR-018", memberId: "M006", memberName: "英", amount: 8000, type: "deposit", status: "active" },
      {
        id: "TR-019",
        memberId: "",
        memberName: "",
        amount: -8000,
        type: "transfer",
        project: "帳房取款",
        description: "資金支出",
        status: "active",
      },
    ],
  },
  {
    date: "2023-05-11",
    transactions: [
      {
        id: "TR-020",
        memberId: "M003",
        memberName: "大雄(林林)",
        amount: -30000,
        type: "return",
        project: "A項目",
        status: "active",
      },
      { id: "TR-021", memberId: "M005", memberName: "點", amount: 10000, type: "sign", status: "active" },
      { id: "TR-022", memberId: "M006", memberName: "英", amount: 5000, type: "buy", status: "active" },
    ],
  },
  {
    date: "2023-05-10",
    transactions: [
      { id: "TR-023", memberId: "M005", memberName: "點", amount: -29700, type: "redeem", status: "active" },
      { id: "TR-024", memberId: "M006", memberName: "英", amount: -15000, type: "withdrawal", status: "active" },
      {
        id: "TR-025",
        memberId: "",
        memberName: "",
        amount: -5000,
        type: "labor",
        description: "員工薪資",
        status: "active",
      },
      {
        id: "TR-026",
        memberId: "",
        memberName: "",
        amount: -10000,
        type: "misc",
        originalType: "rent",
        description: "場地租金",
        status: "active",
      },
      {
        id: "TR-027",
        memberId: "",
        memberName: "",
        amount: -3000,
        type: "misc",
        originalType: "system",
        description: "系統維護費",
        status: "active",
      },
      {
        id: "TR-028",
        memberId: "",
        memberName: "",
        amount: -2000,
        type: "misc",
        description: "辦公用品",
        status: "active",
      },
      {
        id: "TR-029",
        memberId: "",
        memberName: "",
        amount: -8000,
        type: "accounting",
        description: "月度帳房費用",
        status: "active",
      },
      {
        id: "TR-030",
        memberId: "",
        memberName: "",
        amount: 50000,
        type: "capital",
        description: "追加本金",
        status: "active",
      },
    ],
  },
]

interface TransactionListProps {
  showOnlyToday?: boolean
  showAllTypes?: boolean
}

export default function TransactionList({ showOnlyToday = false, showAllTypes = false }: TransactionListProps) {
  const [activeType, setActiveType] = useState("all")
  const [forceListView, setForceListView] = useState(false)
  const [showCanceledTransactions, setShowCanceledTransactions] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [cancelReason, setCancelReason] = useState("")
  const today = new Date().toISOString().split("T")[0] // 獲取今天的日期，格式為 YYYY-MM-DD

  // 當 showAllTypes 為 true 時，自動設置 activeType 為 "all"
  useEffect(() => {
    if (showAllTypes) {
      setActiveType("all")
    }
  }, [showAllTypes])

  // 根據 showOnlyToday 參數過濾數據
  const filteredByDateData = showOnlyToday ? transactionData.filter((day) => day.date === today) : transactionData

  // 獲取所有唯一的會員
  const allMembers = Array.from(
    new Set(
      filteredByDateData
        .flatMap((day) =>
          day.transactions
            .filter((t) => t.memberId && t.memberName) // 只包含有會員ID和名稱的交易
            .map((t) => ({ id: t.memberId, name: t.memberName })),
        )
        .map(JSON.stringify),
    ),
  ).map((str) => JSON.parse(str))

  // 根據選擇的類型篩選交易
  const filteredTransactionData = filteredByDateData
    .map((dayData) => {
      let filteredTransactions = dayData.transactions

      // 過濾已取消的交易（如果不顯示）
      if (!showCanceledTransactions) {
        filteredTransactions = filteredTransactions.filter((t) => t.status !== "canceled")
      }

      // 無論是否在儀表板模式，都按照選擇的類型過濾
      if (activeType !== "all") {
        if (activeType === "sign_table") {
          // 簽碼表顯示簽碼和還碼的記錄
          filteredTransactions = filteredTransactions.filter((t) => ["sign", "return"].includes(t.type))
        } else if (activeType === "rent") {
          // 場租顯示雜費中標記為場租的記錄
          filteredTransactions = filteredTransactions.filter((t) => t.type === "misc" && t.originalType === "rent")
        } else if (activeType === "system") {
          // 系統顯示雜費中標記為系統的記錄
          filteredTransactions = filteredTransactions.filter((t) => t.type === "misc" && t.originalType === "system")
        } else if (activeType === "deposit_withdrawal") {
          // 存取明細顯示存款和取款的記錄
          filteredTransactions = filteredTransactions.filter((t) => ["deposit", "withdrawal"].includes(t.type))
        } else if (activeType === "accounting") {
          // 帳房顯示帳房記錄
          filteredTransactions = filteredTransactions.filter((t) => t.type === "accounting")
        } else if (activeType === "capital") {
          // 本金顯示本金記錄
          filteredTransactions = filteredTransactions.filter((t) => t.type === "capital")
        } else if (activeType === "project") {
          // 項目顯示有項目標記的記錄
          filteredTransactions = filteredTransactions.filter((t) => t.project && t.type !== "transfer")
        } else if (activeType === "transfer") {
          // 轉帳顯示轉帳記錄
          filteredTransactions = filteredTransactions.filter((t) => t.type === "transfer")
        } else {
          filteredTransactions = filteredTransactions.filter((t) => t.type === activeType)
        }
      }

      return {
        ...dayData,
        transactions: filteredTransactions,
      }
    })
    .filter((day) => day.transactions.length > 0) // 過濾掉沒有交易的日期

  // 計算每個會員的總額（基於篩選後的數據）
  const memberTotals = allMembers.reduce((acc, member) => {
    acc[member.id] = filteredTransactionData.reduce((sum, day) => {
      const memberTransactions = day.transactions.filter((t) => t.memberId === member.id && t.status === "active")
      return sum + memberTransactions.reduce((memberSum, t) => memberSum + t.amount, 0)
    }, 0)
    return acc
  }, {})

  // 計算系統交易總額（無會員的交易）
  const systemTransactions = filteredTransactionData.flatMap((day) =>
    day.transactions.filter((t) => (!t.memberId || !t.memberName) && t.status === "active"),
  )

  const systemTotal = systemTransactions.reduce((sum, t) => sum + t.amount, 0)

  // 計算總交易額（只計算活躍交易）
  const totalAmount = Object.values(memberTotals).reduce((a: any, b) => a + b, 0) + systemTotal

  // 計算每種類型的交易數量
  const typeCounts = transactionTypeFilters.reduce((acc, type) => {
    if (type.id === "all") {
      acc[type.id] = filteredByDateData.flatMap((d) => d.transactions).length
    } else if (type.id === "sign_table") {
      acc[type.id] = filteredByDateData
        .flatMap((d) => d.transactions)
        .filter((t) => ["sign", "return"].includes(t.type)).length
    } else if (type.id === "rent") {
      acc[type.id] = filteredByDateData
        .flatMap((d) => d.transactions)
        .filter((t) => t.type === "misc" && t.originalType === "rent").length
    } else if (type.id === "system") {
      acc[type.id] = filteredByDateData
        .flatMap((d) => d.transactions)
        .filter((t) => t.type === "misc" && t.originalType === "system").length
    } else if (type.id === "deposit_withdrawal") {
      acc[type.id] = filteredByDateData
        .flatMap((d) => d.transactions)
        .filter((t) => ["deposit", "withdrawal"].includes(t.type)).length
    } else if (type.id === "accounting") {
      acc[type.id] = filteredByDateData.flatMap((d) => d.transactions).filter((t) => t.type === "accounting").length
    } else if (type.id === "capital") {
      acc[type.id] = filteredByDateData.flatMap((d) => d.transactions).filter((t) => t.type === "capital").length
    } else if (type.id === "project") {
      acc[type.id] = filteredByDateData
        .flatMap((d) => d.transactions)
        .filter((t) => t.project && t.type !== "transfer").length
    } else if (type.id === "transfer") {
      acc[type.id] = filteredByDateData.flatMap((d) => d.transactions).filter((t) => t.type === "transfer").length
    } else {
      acc[type.id] = filteredByDateData.flatMap((d) => d.transactions).filter((t) => t.type === type.id).length
    }
    return acc
  }, {})

  // 判斷是否使用網格式布局
  const useGridLayout =
    !forceListView &&
    (["buy", "redeem", "sign_table", "deposit_withdrawal", "transfer"].includes(activeType) ||
      (activeType === "all" && filteredByDateData.some((day) => day.transactions.some((t) => t.type === "transfer"))))

  // 將所有交易扁平化為一個列表（用於清單式布局）
  const flattenedTransactions = filteredTransactionData
    .flatMap((day) =>
      day.transactions.map((transaction) => ({
        ...transaction,
        date: day.date,
      })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 處理取消交易
  const handleCancelTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setCancelReason("")
    setCancelDialogOpen(true)
  }

  // 確認取消交易
  const confirmCancelTransaction = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "錯誤",
        description: "請輸入取消原因",
        variant: "destructive",
      })
      return
    }

    try {
      // 實際應用中，這裡會調用API取消交易
      // const response = await fetch('/api/transactions', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     recordId: selectedTransaction.id,
      //     action: 'cancel',
      //     canceledBy: 1, // 當前用戶ID
      //     cancelReason
      //   })
      // })
      // const result = await response.json()

      // 模擬API調用
      console.log("取消交易:", selectedTransaction.id, cancelReason)

      // 更新本地狀態（實際應用中應該重新獲取數據）
      // 這裡只是為了演示
      selectedTransaction.status = "canceled"
      selectedTransaction.cancelReason = cancelReason

      toast({
        title: "交易已取消",
        description: `交易 ${selectedTransaction.id} 已成功取消`,
      })

      setCancelDialogOpen(false)
    } catch (error) {
      toast({
        title: "取消交易失敗",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {showOnlyToday && (
        <div className="hidden md:block mb-4 overflow-x-auto -mx-6 px-6">
          <div className="flex flex-wrap gap-1.5 pb-2">
            {visibleTransactionTypeFilters.map((type) => {
              const Icon =
                type.id !== "all"
                  ? type.id === "sign_table"
                    ? getTransactionTypeIcon("sign")
                    : type.id === "deposit_withdrawal"
                      ? getTransactionTypeIcon("deposit")
                      : getTransactionTypeIcon(type.id)
                  : null

              return (
                <Button
                  key={type.id}
                  variant={activeType === type.id ? "default" : "outline"}
                  size="xs"
                  onClick={() => setActiveType(type.id)}
                  className="whitespace-nowrap h-7 px-2 text-xs"
                >
                  {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
                  {type.name}
                  <Badge variant="secondary" className="ml-1.5 bg-gray-100 text-xs px-1.5 py-0 min-w-4 h-4">
                    {typeCounts[type.id]}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>
      )}
      {!showOnlyToday && (
        <Card className="hidden md:block">
          <CardHeader className="pb-0">
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2 justify-center">
                {visibleTransactionTypeFilters.map((type) => {
                  const Icon =
                    type.id !== "all"
                      ? type.id === "sign_table"
                        ? getTransactionTypeIcon("sign")
                        : type.id === "deposit_withdrawal"
                          ? getTransactionTypeIcon("deposit")
                          : getTransactionTypeIcon(type.id)
                      : null

                  return (
                    <Button
                      key={type.id}
                      variant={activeType === type.id && !forceListView ? "default" : "outline"}
                      size="xs"
                      onClick={() => {
                        setActiveType(type.id)
                        setForceListView(false)
                      }}
                      className="whitespace-nowrap h-7 px-2 text-xs"
                    >
                      {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
                      {type.name}
                      <Badge variant="secondary" className="ml-1.5 bg-gray-100 text-xs px-1.5 py-0 min-w-4 h-4">
                        {typeCounts[type.id]}
                      </Badge>
                    </Button>
                  )
                })}
                <Button
                  variant={forceListView ? "default" : "outline"}
                  size="xs"
                  onClick={() => {
                    setActiveType("all")
                    setForceListView(true)
                  }}
                  className="whitespace-nowrap h-7 px-2 text-xs"
                >
                  全部(清單)
                  <Badge variant="secondary" className="ml-1.5 bg-gray-100 text-xs px-1.5 py-0 min-w-4 h-4">
                    {typeCounts["all"]}
                  </Badge>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center">
              <span>
                {showOnlyToday
                  ? "今日交易記錄"
                  : `交易記錄 - ${transactionTypeFilters.find((t) => t.id === activeType)?.name}`}
              </span>
              {showOnlyToday && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {today}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCanceledTransactions(!showCanceledTransactions)}
                className="text-xs"
              >
                {showCanceledTransactions ? "隱藏已取消" : "顯示已取消"}
              </Button>
              {(activeType !== "all" || showOnlyToday) && (
                <span className="text-lg">總額: {totalAmount.toLocaleString()}</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactionData.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {showOnlyToday ? "今天還沒有交易記錄" : "沒有找到符合條件的交易記錄"}
            </div>
          ) : useGridLayout ? (
            // 網格式布局 - 用於買碼、兌碼、簽碼表、存取明細、轉帳
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-center text-xs font-medium text-gray-500">
                    <th className="px-4 py-3 whitespace-nowrap">日期</th>
                    {allMembers.map((member) => (
                      <th key={member.id} className="px-4 py-3 whitespace-nowrap">
                        ({member.name})
                      </th>
                    ))}
                    {systemTransactions.length > 0 && (
                      <>
                        <th className="px-4 py-3 whitespace-nowrap">(系統支出)</th>
                        <th className="px-4 py-3 whitespace-nowrap">(項目)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactionData.map((dayData, index) => (
                    <tr key={dayData.date} className="border-b text-sm">
                      <td className="px-4 py-3 text-center">{dayData.date}</td>
                      {allMembers.map((member) => {
                        const memberTransactions = dayData.transactions.filter((t) => t.memberId === member.id)
                        const activeTransactions = memberTransactions.filter((t) => t.status === "active")
                        const canceledTransactions = memberTransactions.filter((t) => t.status === "canceled")
                        const totalAmount = activeTransactions.reduce((sum, t) => sum + t.amount, 0)

                        return (
                          <td key={member.id} className="px-4 py-3 text-center">
                            {activeTransactions.length > 0 && (
                              <span style={{ color: totalAmount < 0 ? "red" : "inherit" }}>
                                {totalAmount.toLocaleString()}
                              </span>
                            )}
                            {canceledTransactions.length > 0 && showCanceledTransactions && (
                              <div className="mt-1">
                                <Badge variant="outline" className="bg-red-50 text-red-700 line-through">
                                  已取消: {canceledTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                </Badge>
                              </div>
                            )}
                          </td>
                        )
                      })}
                      {systemTransactions.length > 0 && (
                        <>
                          <td className="px-4 py-3 text-center">
                            {dayData.transactions.filter(
                              (t) => (!t.memberId || !t.memberName) && !t.project && t.status === "active",
                            ).length > 0 && (
                              <span style={{ color: "red" }}>
                                {dayData.transactions
                                  .filter((t) => (!t.memberId || !t.memberName) && !t.project && t.status === "active")
                                  .reduce((sum, t) => sum + t.amount, 0)
                                  .toLocaleString()}
                              </span>
                            )}
                            {dayData.transactions.filter(
                              (t) => (!t.memberId || !t.memberName) && !t.project && t.status === "canceled",
                            ).length > 0 &&
                              showCanceledTransactions && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="bg-red-50 text-red-700 line-through">
                                    已取消:{" "}
                                    {dayData.transactions
                                      .filter(
                                        (t) => (!t.memberId || !t.memberName) && !t.project && t.status === "canceled",
                                      )
                                      .reduce((sum, t) => sum + t.amount, 0)
                                      .toLocaleString()}
                                  </Badge>
                                </div>
                              )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {dayData.transactions
                              .filter((t) => t.project && t.status === "active")
                              .map((t, i) => (
                                <div key={i} className="mb-1">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {t.project}: {t.amount.toLocaleString()}
                                  </Badge>
                                </div>
                              ))}
                            {dayData.transactions
                              .filter((t) => t.project && t.status === "canceled")
                              .map(
                                (t, i) =>
                                  showCanceledTransactions && (
                                    <div key={`canceled-${i}`} className="mb-1">
                                      <Badge variant="outline" className="bg-red-50 text-red-700 line-through">
                                        {t.project}: {t.amount.toLocaleString()} (已取消)
                                      </Badge>
                                    </div>
                                  ),
                              )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-green-50 font-medium">
                    <td className="px-4 py-3 text-center">總計</td>
                    {allMembers.map((member) => (
                      <td key={member.id} className="px-4 py-3 text-center">
                        <span style={{ color: memberTotals[member.id] < 0 ? "red" : "inherit" }}>
                          {memberTotals[member.id].toLocaleString()}
                        </span>
                      </td>
                    ))}
                    {systemTransactions.length > 0 && (
                      <>
                        <td className="px-4 py-3 text-center">
                          <span style={{ color: systemTotal < 0 ? "red" : "inherit" }}>
                            {systemTransactions
                              .filter((t) => !t.project)
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span>
                            {systemTransactions
                              .filter((t) => t.project)
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString()}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            // 清單式布局 - 用於其他交易類型
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                    <th className="px-4 py-3">日期</th>
                    <th className="px-4 py-3">會員</th>
                    <th className="px-4 py-3">類型</th>
                    <th className="px-4 py-3">金額</th>
                    <th className="px-4 py-3">項目</th>
                    <th className="px-4 py-3">說明</th>
                    <th className="px-4 py-3">狀態</th>
                    <th className="px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {flattenedTransactions.length > 0 ? (
                    flattenedTransactions.map((transaction, index) => {
                      const TypeIcon = getTransactionTypeIcon(transaction.type)
                      const typeColor = getTransactionTypeColor(transaction.type)
                      const isCanceled = transaction.status === "canceled"

                      return (
                        <tr key={index} className={`border-b text-sm ${isCanceled ? "bg-red-50" : ""}`}>
                          <td className="px-4 py-3">{transaction.date}</td>
                          <td className="px-4 py-3">
                            {transaction.memberId ? (
                              <Link
                                href={`/members/${transaction.memberId}`}
                                className={`text-blue-600 hover:underline ${isCanceled ? "line-through" : ""}`}
                              >
                                {transaction.memberName}
                              </Link>
                            ) : (
                              "系統"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center ${typeColor} ${isCanceled ? "line-through" : ""}`}>
                              <TypeIcon className="mr-1 h-4 w-4" />
                              {getTransactionTypeName(transaction.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              style={{ color: transaction.amount < 0 ? "red" : "inherit" }}
                              className={isCanceled ? "line-through" : ""}
                            >
                              {transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {transaction.project ? (
                              <Badge
                                variant="outline"
                                className={`bg-blue-50 text-blue-700 ${isCanceled ? "line-through" : ""}`}
                              >
                                {transaction.project}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3" className={isCanceled ? "line-through" : ""}>
                            {transaction.description || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {isCanceled ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Ban className="h-3 w-3" />
                                已取消
                              </Badge>
                            ) : (
                              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                                有效
                              </Badge>
                            )}
                            {isCanceled && transaction.cancelReason && (
                              <div className="mt-1 text-xs text-red-600">原因: {transaction.cancelReason}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                查看
                              </Button>
                              {!isCanceled && (
                                <Button variant="ghost" size="sm" onClick={() => handleCancelTransaction(transaction)}>
                                  <Ban className="h-4 w-4 mr-1 text-red-500" />
                                  取消
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    `https://t.me/share/url?url=交易記錄&text=交易ID: ${transaction.id}%0A類型: ${getTransactionTypeName(transaction.type)}%0A金額: ${transaction.amount.toLocaleString()}`,
                                    "_blank",
                                  )
                                }
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                分享
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        沒有找到符合條件的交易記錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 取消交易對話框 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消交易</DialogTitle>
            <DialogDescription>您確定要取消此交易嗎？取消後交易將被標記為無效，但記錄會被保留。</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">交易ID</p>
                  <p>{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">交易類型</p>
                  <p>{getTransactionTypeName(selectedTransaction.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">金額</p>
                  <p className={selectedTransaction.amount < 0 ? "text-red-500" : "text-green-500"}>
                    {selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">會員</p>
                  <p>{selectedTransaction.memberName || "系統"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="cancelReason" className="text-sm font-medium">
                  取消原因 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="請輸入取消此交易的原因"
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmCancelTransaction}>
              <AlertCircle className="mr-2 h-4 w-4" />
              確認取消交易
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

