"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Share2, Calendar } from "lucide-react"
import Link from "next/link"
import { getTransactionTypeName, getTransactionTypeIcon, getTransactionTypeColor } from "@/lib/transaction-types"

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
      { memberId: "M001", memberName: "友短", amount: 5000, type: "buy" },
      { memberId: "M002", memberName: "大雄", amount: 10000, type: "buy" },
      { memberId: "M003", memberName: "大雄(林林)", amount: 10000, type: "sign", project: "A項目" },
      {
        memberId: "",
        memberName: "",
        amount: 20000,
        type: "transfer",
        project: "存款轉至帳房",
        description: "資金轉移",
      },
    ],
  },
  {
    date: "2023-05-14",
    transactions: [
      { memberId: "M004", memberName: "大雄(花姐)", amount: 10000, type: "sign" },
      { memberId: "M005", memberName: "點", amount: 5000, type: "buy" },
      { memberId: "M006", memberName: "英", amount: 5000, type: "buy" },
      { memberId: "M007", memberName: "華姐", amount: 5000, type: "buy" },
    ],
  },
  {
    date: "2023-05-13",
    transactions: [
      { memberId: "M001", memberName: "友短", amount: -5000, type: "return" },
      { memberId: "M002", memberName: "大雄", amount: 5000, type: "buy" },
      { memberId: "M003", memberName: "大雄(林林)", amount: 10000, type: "sign", project: "B項目" },
      { memberId: "M005", memberName: "點", amount: 5000, type: "buy" },
      { memberId: "M006", memberName: "英", amount: -5000, type: "return" },
      { memberId: "M007", memberName: "華姐", amount: -5000, type: "return" },
      {
        memberId: "",
        memberName: "",
        amount: 15000,
        type: "transfer",
        project: "帳房轉至存款",
        description: "資金轉移",
      },
    ],
  },
  {
    date: "2023-05-12",
    transactions: [
      { memberId: "M003", memberName: "大雄(林林)", amount: 10000, type: "sign", project: "A項目" },
      { memberId: "M005", memberName: "點", amount: 10000, type: "deposit" },
      { memberId: "M006", memberName: "英", amount: 8000, type: "deposit" },
      { memberId: "", memberName: "", amount: -8000, type: "transfer", project: "帳房取款", description: "資金支出" },
    ],
  },
  {
    date: "2023-05-11",
    transactions: [
      { memberId: "M003", memberName: "大雄(林林)", amount: -30000, type: "return", project: "A項目" },
      { memberId: "M005", memberName: "點", amount: 10000, type: "sign" },
      { memberId: "M006", memberName: "英", amount: 5000, type: "buy" },
    ],
  },
  {
    date: "2023-05-10",
    transactions: [
      { memberId: "M005", memberName: "點", amount: -29700, type: "redeem" },
      { memberId: "M006", memberName: "英", amount: -15000, type: "withdrawal" },
      { memberId: "", memberName: "", amount: -5000, type: "labor", description: "員工薪資" },
      { memberId: "", memberName: "", amount: -10000, type: "misc", originalType: "rent", description: "場地租金" },
      { memberId: "", memberName: "", amount: -3000, type: "misc", originalType: "system", description: "系統維護費" },
      { memberId: "", memberName: "", amount: -2000, type: "misc", description: "辦公用品" },
      { memberId: "", memberName: "", amount: -8000, type: "accounting", description: "月度帳房費用" },
      { memberId: "", memberName: "", amount: 50000, type: "capital", description: "追加本金" },
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

      // 無論是否在儀表板模式，都按照選擇的類型過濾
      if (activeType !== "all") {
        if (activeType === "sign_table") {
          // 簽碼表顯示簽碼和還碼的記錄
          filteredTransactions = dayData.transactions.filter((t) => ["sign", "return"].includes(t.type))
        } else if (activeType === "rent") {
          // 場租顯示雜費中標記為場租的記錄
          filteredTransactions = dayData.transactions.filter((t) => t.type === "misc" && t.originalType === "rent")
        } else if (activeType === "system") {
          // 系統顯示雜費中標記為系統的記錄
          filteredTransactions = dayData.transactions.filter((t) => t.type === "misc" && t.originalType === "system")
        } else if (activeType === "deposit_withdrawal") {
          // 存取明細顯示存款和取款的記錄
          filteredTransactions = dayData.transactions.filter((t) => ["deposit", "withdrawal"].includes(t.type))
        } else if (activeType === "accounting") {
          // 帳房顯示帳房記錄
          filteredTransactions = dayData.transactions.filter((t) => t.type === "accounting")
        } else if (activeType === "capital") {
          // 本金顯示本金記錄
          filteredTransactions = dayData.transactions.filter((t) => t.type === "capital")
        } else if (activeType === "project") {
          // 項目顯示有項目標記的記錄
          filteredTransactions = dayData.transactions.filter((t) => t.project && t.type !== "transfer")
        } else if (activeType === "transfer") {
          // 轉帳顯示轉帳記錄
          filteredTransactions = dayData.transactions.filter((t) => t.type === "transfer")
        } else {
          filteredTransactions = dayData.transactions.filter((t) => t.type === activeType)
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
      const memberTransactions = day.transactions.filter((t) => t.memberId === member.id)
      return sum + memberTransactions.reduce((memberSum, t) => memberSum + t.amount, 0)
    }, 0)
    return acc
  }, {})

  // 計算系統交易總額（無會員的交易）
  const systemTransactions = filteredTransactionData.flatMap((day) =>
    day.transactions.filter((t) => !t.memberId || !t.memberName),
  )

  const systemTotal = systemTransactions.reduce((sum, t) => sum + t.amount, 0)

  // 計算總交易額
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
            {(activeType !== "all" || showOnlyToday) && (
              <span className="text-lg">總額: {totalAmount.toLocaleString()}</span>
            )}
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
                        const totalAmount = memberTransactions.reduce((sum, t) => sum + t.amount, 0)

                        return (
                          <td key={member.id} className="px-4 py-3 text-center">
                            {memberTransactions.length > 0 && (
                              <span style={{ color: totalAmount < 0 ? "red" : "inherit" }}>
                                {totalAmount.toLocaleString()}
                              </span>
                            )}
                          </td>
                        )
                      })}
                      {systemTransactions.length > 0 && (
                        <>
                          <td className="px-4 py-3 text-center">
                            {dayData.transactions.filter((t) => (!t.memberId || !t.memberName) && !t.project).length >
                              0 && (
                              <span style={{ color: "red" }}>
                                {dayData.transactions
                                  .filter((t) => (!t.memberId || !t.memberName) && !t.project)
                                  .reduce((sum, t) => sum + t.amount, 0)
                                  .toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {dayData.transactions
                              .filter((t) => t.project)
                              .map((t, i) => (
                                <div key={i} className="mb-1">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {t.project}: {t.amount.toLocaleString()}
                                  </Badge>
                                </div>
                              ))}
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
                    <th className="px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {flattenedTransactions.length > 0 ? (
                    flattenedTransactions.map((transaction, index) => {
                      const TypeIcon = getTransactionTypeIcon(transaction.type)
                      const typeColor = getTransactionTypeColor(transaction.type)

                      return (
                        <tr key={index} className="border-b text-sm">
                          <td className="px-4 py-3">{transaction.date}</td>
                          <td className="px-4 py-3">
                            {transaction.memberId ? (
                              <Link href={`/members/${transaction.memberId}`} className="text-blue-600 hover:underline">
                                {transaction.memberName}
                              </Link>
                            ) : (
                              "系統"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center ${typeColor}`}>
                              <TypeIcon className="mr-1 h-4 w-4" />
                              {getTransactionTypeName(transaction.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span style={{ color: transaction.amount < 0 ? "red" : "inherit" }}>
                              {transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {transaction.project ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {transaction.project}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3">{transaction.description || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                查看
                              </Button>
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
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
    </div>
  )
}

