"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// 模擬客戶結欠數據
const customerDebts = [
  { id: "M001", name: "張三", phone: "1234-5678", debt: 2000, lastTransaction: "2023-05-15" },
  { id: "M003", name: "王五", phone: "3456-7890", debt: 5000, lastTransaction: "2023-05-14" },
  { id: "M005", name: "張偉", phone: "5678-9012", debt: 3500, lastTransaction: "2023-05-13" },
  { id: "M006", name: "王偉", phone: "6789-0123", debt: 800, lastTransaction: "2023-05-12" },
  { id: "M008", name: "陳明", phone: "8901-2345", debt: 1200, lastTransaction: "2023-05-11" },
  { id: "M009", name: "黃小明", phone: "9012-3456", debt: 7000, lastTransaction: "2023-05-10" },
]

export default function CustomerDebtList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("")

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>客戶結欠清單</CardTitle>
          <Button variant="ghost" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            排序
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜索會員..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Label htmlFor="sort-by" className="text-sm whitespace-nowrap">
              排序方式:
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by" className="w-full sm:w-40">
                <SelectValue placeholder="選擇排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount-desc">金額 (高至低)</SelectItem>
                <SelectItem value="amount-asc">金額 (低至高)</SelectItem>
                <SelectItem value="name-asc">會員名稱 (A-Z)</SelectItem>
                <SelectItem value="name-desc">會員名稱 (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">姓名</th>
                <th className="px-4 py-3">電話</th>
                <th className="px-4 py-3">結欠金額</th>
                <th className="px-4 py-3">最後交易</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {customerDebts.map((customer) => (
                <tr key={customer.id} className="border-b text-sm">
                  <td className="px-4 py-3">{customer.id}</td>
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">${customer.debt}</td>
                  <td className="px-4 py-3">{customer.lastTransaction}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link href={`/members/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          查看
                        </Button>
                      </Link>
                      <Link href={`/transactions/repayment?memberId=${customer.id}`}>
                        <Button size="sm">還款</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

