import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, TrendingUp, TrendingDown } from "lucide-react"

// 模擬簽碼表數據
const signTableData = [
  {
    id: "TX123458",
    member: "王五",
    memberId: "M003",
    type: "簽碼",
    typeId: "sign",
    amount: 2000,
    date: "2023-05-14 19:20",
    status: "盈利",
    description: "第3局",
  },
  {
    id: "TX123459",
    member: "趙六",
    memberId: "M004",
    type: "還碼",
    typeId: "return",
    amount: 1500,
    date: "2023-05-14 10:15",
    status: "虧損",
    description: "第2局",
  },
  {
    id: "TX123464",
    member: "李明",
    memberId: "M007",
    type: "簽碼",
    typeId: "sign",
    amount: 3000,
    date: "2023-05-11 15:20",
    status: "盈利",
    description: "第5局",
  },
  {
    id: "TX123465",
    member: "陳明",
    memberId: "M008",
    type: "還碼",
    typeId: "return",
    amount: 2500,
    date: "2023-05-11 11:05",
    status: "虧損",
    description: "第4局",
  },
  {
    id: "TX123470",
    member: "張三",
    memberId: "M001",
    type: "簽碼",
    typeId: "sign",
    amount: 5000,
    date: "2023-05-10 16:40",
    status: "盈利",
    description: "第1局",
  },
  {
    id: "TX123471",
    member: "李四",
    memberId: "M002",
    type: "還碼",
    typeId: "return",
    amount: 3500,
    date: "2023-05-10 14:20",
    status: "虧損",
    description: "第6局",
  },
]

export default function SignTableList() {
  // 計算總盈虧
  const totalProfit = signTableData.reduce((total, transaction) => {
    if (transaction.typeId === "sign") {
      return total + transaction.amount
    } else if (transaction.typeId === "return") {
      return total - transaction.amount
    }
    return total
  }, 0)

  // 計算簽碼總額
  const totalSign = signTableData.reduce((total, transaction) => {
    if (transaction.typeId === "sign") {
      return total + transaction.amount
    }
    return total
  }, 0)

  // 計算還碼總額
  const totalReturn = signTableData.reduce((total, transaction) => {
    if (transaction.typeId === "return") {
      return total + transaction.amount
    }
    return total
  }, 0)

  // 按會員分組數據
  const memberSummary = signTableData.reduce((acc, transaction) => {
    if (!acc[transaction.memberId]) {
      acc[transaction.memberId] = {
        member: transaction.member,
        memberId: transaction.memberId,
        signAmount: 0,
        returnAmount: 0,
        netProfit: 0,
      }
    }

    if (transaction.typeId === "sign") {
      acc[transaction.memberId].signAmount += transaction.amount
      acc[transaction.memberId].netProfit += transaction.amount
    } else if (transaction.typeId === "return") {
      acc[transaction.memberId].returnAmount += transaction.amount
      acc[transaction.memberId].netProfit -= transaction.amount
    }

    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* 簽碼表摘要 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>簽碼表摘要 - {new Date().toLocaleDateString("zh-HK")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <h3 className="text-sm font-medium text-green-700">簽碼總額</h3>
              <p className="mt-2 text-2xl font-bold text-green-600">+${totalSign}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <h3 className="text-sm font-medium text-red-700">還碼總額</h3>
              <p className="mt-2 text-2xl font-bold text-red-600">-${totalReturn}</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${totalProfit >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
              <h3 className={`text-sm font-medium ${totalProfit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                淨盈虧
              </h3>
              <p className={`mt-2 text-2xl font-bold ${totalProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                {totalProfit >= 0 ? "+" : "-"}${Math.abs(totalProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 會員簽碼摘要 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>會員簽碼摘要</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th className="px-4 py-3">會員</th>
                  <th className="px-4 py-3 text-right">簽碼金額</th>
                  <th className="px-4 py-3 text-right">還碼金額</th>
                  <th className="px-4 py-3 text-right">淨盈虧</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(memberSummary).map((summary: any) => (
                  <tr key={summary.memberId} className="border-b text-sm">
                    <td className="px-4 py-3">
                      <Link href={`/members/${summary.memberId}`} className="text-blue-600 hover:underline">
                        {summary.member}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">+${summary.signAmount}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">-${summary.returnAmount}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span className={summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                        {summary.netProfit >= 0 ? "+" : "-"}${Math.abs(summary.netProfit)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/members/${summary.memberId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          詳情
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td className="px-4 py-3">總計</td>
                  <td className="px-4 py-3 text-right text-green-600">+${totalSign}</td>
                  <td className="px-4 py-3 text-right text-red-600">-${totalReturn}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                      {totalProfit >= 0 ? "+" : "-"}${Math.abs(totalProfit)}
                    </span>
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 交易明細 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>交易明細</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">會員</th>
                  <th className="px-4 py-3">類型</th>
                  <th className="px-4 py-3">金額</th>
                  <th className="px-4 py-3">日期</th>
                  <th className="px-4 py-3">說明</th>
                  <th className="px-4 py-3">狀態</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {signTableData.map((transaction) => (
                  <tr key={transaction.id} className="border-b text-sm">
                    <td className="px-4 py-3">{transaction.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/members/${transaction.memberId}`} className="text-blue-600 hover:underline">
                        {transaction.member}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.typeId === "sign" ? (
                        <span className="flex items-center text-green-600">
                          <TrendingUp className="mr-1 h-4 w-4" />
                          {transaction.type}
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <TrendingDown className="mr-1 h-4 w-4" />
                          {transaction.type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.typeId === "sign" ? (
                        <span className="text-green-600">+${transaction.amount}</span>
                      ) : (
                        <span className="text-red-600">-${transaction.amount}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{transaction.date}</td>
                    <td className="px-4 py-3">{transaction.description || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={transaction.status === "盈利" ? "success" : "destructive"}
                        className={
                          transaction.status === "盈利" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/transactions/${transaction.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">查看</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

