import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getTransactionTypeLabel, getTransactionStatusLabel } from "@/lib/utils"
import Link from "next/link"

interface Transaction {
  id: string
  amount: string
  type: string
  status: string
  createdAt: string
  memberId: string
  memberName: string | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // 交易狀態對應的 Badge 樣式
  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    pending: "secondary",
    failed: "destructive",
    cancelled: "outline",
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>交易 ID</TableHead>
              <TableHead>會員</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/transactions/${transaction.id}`} className="hover:underline">
                      {transaction.id.substring(0, 8)}...
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/members/${transaction.memberId}`} className="hover:underline">
                      {transaction.memberName || "未知會員"}
                    </Link>
                  </TableCell>
                  <TableCell>{getTransactionTypeLabel(transaction.type)}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[transaction.status] || "default"}>
                      {getTransactionStatusLabel(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.createdAt}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  暫無交易記錄
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/transactions" className="text-sm font-medium text-primary hover:underline">
          查看所有交易 →
        </Link>
      </div>
    </div>
  )
}

