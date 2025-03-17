import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  amount: string
  type: string
  status: string
  createdAt: string
  memberId: string | null
  memberName: string | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // 交易類型圖標
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500" />
    }
  }

  // 交易狀態標籤
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            已完成
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            處理中
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            已取消
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 交易類型中文名稱
  const getTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      deposit: "存款",
      withdrawal: "提款",
      transfer: "轉賬",
      bet: "下注",
      win: "贏錢",
      loss: "輸錢",
      credit: "賒帳",
      repayment: "還款",
    }
    return typeMap[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近交易</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>交易類型</TableHead>
              <TableHead>會員</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>時間</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span>{getTransactionType(transaction.type)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.memberName ? (
                    <Link href={`/admin/members/${transaction.memberId}`} className="text-blue-600 hover:underline">
                      {transaction.memberName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">系統</span>
                  )}
                </TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>{transaction.createdAt}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/transactions/${transaction.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    詳情
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-center">
          <Link href="/admin/transactions" className="text-sm text-blue-600 hover:underline">
            查看所有交易
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

