"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import {
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import type { JSX } from "react"
import { getMemberById, getMemberTransactions, getMemberDebt } from "@/lib/member-service"

type Member = {
  id: number
  memberId: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  type: "shareholder" | "agent" | "regular"
  agentId: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

type Transaction = {
  id: number
  recordId: string
  transactionType: string
  amount: number
  description: string | null
  status: "active" | "canceled" | "pending" | "completed"
  createdAt: string
  canceledAt: string | null
  cancelReason: string | null
}

interface MemberDetailProps {
  memberId: string
}

export default function MemberDetail({ memberId }: MemberDetailProps) {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalDebt, setTotalDebt] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemberDetails()
  }, [memberId])

  const fetchMemberDetails = async () => {
    try {
      setLoading(true)
      const memberData = await getMemberById(Number(memberId))
      setMember(memberData)

      const transactionData = await getMemberTransactions(memberId)
      setTransactions(transactionData)

      const debtData = await getMemberDebt(memberId)
      setTotalDebt(debtData)
    } catch (error) {
      console.error("Error fetching member details:", error)
      toast({
        title: "錯誤",
        description: "無法獲取會員詳情",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getMemberTypeLabel = (type: string) => {
    switch (type) {
      case "shareholder":
        return { label: "股東", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
      case "agent":
        return { label: "代理", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
      case "regular":
        return { label: "普通會員", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
      default:
        return { label: type, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "buy_chips":
        return { label: "買入籌碼", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
      case "sell_chips":
        return { label: "賣出籌碼", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
      case "sign_table":
        return { label: "簽單", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" }
      case "return_payment":
        return { label: "還款", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
      case "credit":
        return { label: "信用", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
      case "dividend":
        return { label: "分紅", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" }
      default:
        return { label: type, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" /> 有效
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" /> 已取消
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" /> 處理中
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <CheckCircle className="h-3 w-3 mr-1" /> 已完成
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!member) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">會員不存在</h3>
          <p className="text-muted-foreground mb-4">找不到指定的會員資料</p>
          <Button onClick={() => router.push("/members")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> 返回會員列表
          </Button>
        </CardContent>
      </Card>
    )
  }

  const typeInfo = getMemberTypeLabel(member.type)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">會員詳情</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/members")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> 返回列表
          </Button>
          <Button onClick={() => router.push(`/members/${member.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" /> 編輯會員
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{member.name}</CardTitle>
                <CardDescription>
                  會員ID: {member.memberId} ·
                  <Badge variant="outline" className={`ml-2 ${typeInfo.color}`}>
                    {typeInfo.label}
                  </Badge>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">創建於</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(member.createdAt)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{member.phone || "未設置電話"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{member.email || "未設置電子郵件"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{member.address || "未設置地址"}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>上級代理: {member.agentId ? `ID ${member.agentId}` : "無"}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <span>{member.notes || "無備註"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>結欠金額</CardTitle>
            <CardDescription>會員當前未結清的金額</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <DollarSign className={`h-6 w-6 ${totalDebt > 0 ? "text-red-500" : "text-green-500"}`} />
                  <span className={`text-3xl font-bold ${totalDebt > 0 ? "text-red-500" : "text-green-500"}`}>
                    {formatCurrency(totalDebt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {totalDebt > 0 ? "會員有未結清的欠款" : totalDebt < 0 ? "會員有預付款" : "會員沒有欠款"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/transactions/new?memberId=" + member.memberId)}
            >
              記錄新交易
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>交易記錄</CardTitle>
          <CardDescription>會員的所有交易歷史</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">全部交易</TabsTrigger>
              <TabsTrigger value="active">有效交易</TabsTrigger>
              <TabsTrigger value="debt">欠款記錄</TabsTrigger>
              <TabsTrigger value="payment">還款記錄</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TransactionTable
                transactions={transactions}
                getTransactionTypeLabel={getTransactionTypeLabel}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="active">
              <TransactionTable
                transactions={transactions.filter((t) => t.status === "active")}
                getTransactionTypeLabel={getTransactionTypeLabel}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="debt">
              <TransactionTable
                transactions={transactions.filter(
                  (t) => t.status === "active" && ["sign_table", "credit"].includes(t.transactionType),
                )}
                getTransactionTypeLabel={getTransactionTypeLabel}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="payment">
              <TransactionTable
                transactions={transactions.filter(
                  (t) => t.status === "active" && t.transactionType === "return_payment",
                )}
                getTransactionTypeLabel={getTransactionTypeLabel}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface TransactionTableProps {
  transactions: Transaction[]
  getTransactionTypeLabel: (type: string) => { label: string; color: string }
  getStatusBadge: (status: string) => JSX.Element
}

function TransactionTable({ transactions, getTransactionTypeLabel, getStatusBadge }: TransactionTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>交易ID</TableHead>
            <TableHead>類型</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>描述</TableHead>
            <TableHead>日期</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                沒有找到交易記錄
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => {
              const typeInfo = getTransactionTypeLabel(transaction.transactionType)

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.recordId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeInfo.color}>
                      {typeInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.transactionType === "return_payment" ? "text-green-600" : ""}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                    {transaction.status === "canceled" && transaction.cancelReason && (
                      <div className="text-xs text-muted-foreground mt-1">原因: {transaction.cancelReason}</div>
                    )}
                  </TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

