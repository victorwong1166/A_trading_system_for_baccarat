"use client"
import { useState } from "react"
import { addDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from "lucide-react"
import TransferDialog from "./transfer-dialog"

export default function DashboardSummary({ onDebtClick }) {
  // 計算下一次結算日期（每三天結算一次）
  const nextSettlementDate = addDays(new Date(), 3 - (new Date().getDate() % 3))
  const [transferOpen, setTransferOpen] = useState(false)

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-5 max-w-[80%] mx-auto">
      {/* 買碼和兌碼總額 */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-1.5 px-3">
          <CardTitle className="text-xs font-medium">買碼/兌碼總額</CardTitle>
          <DollarSign className="h-3.5 w-3.5 text-blue-500" />
        </CardHeader>
        <CardContent className="space-y-2 py-1.5 px-3">
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-0.5">買碼總額</div>
            <div className="text-lg font-bold">$45,000</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-0.5">兌碼總額</div>
            <div className="text-lg font-bold">$29,700</div>
          </div>
        </CardContent>
      </Card>

      {/* 簽碼和還碼 */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-1.5 px-3">
          <CardTitle className="text-xs font-medium">簽碼/還碼</CardTitle>
          <div className="flex space-x-1">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 py-1.5 px-3">
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-0.5">簽碼</div>
            <div className="text-lg font-bold text-green-600">+$40,000</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-0.5">還碼</div>
            <div className="text-lg font-bold text-red-600">-$35,000</div>
          </div>
        </CardContent>
      </Card>

      {/* 資金 */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-1.5 px-3">
          <CardTitle className="text-xs font-medium">資金</CardTitle>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTransferOpen(true)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:bg-purple-100 transition-colors text-xs text-purple-500"
              title="資金轉帳"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>轉帳</span>
            </button>
            <Wallet className="h-3.5 w-3.5 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent className="py-1.5 px-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-0.5">簽碼</div>
              <div className="text-sm font-bold">$40,000</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-0.5">銀頭</div>
              <div className="text-sm font-bold">$30,000</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-0.5">存款</div>
              <div className="text-sm font-bold">$25,000</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-0.5">欠款</div>
              <div className="text-sm font-bold text-red-600">-$15,000</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground font-medium mb-0.5">現金</div>
              <div className="text-sm font-bold">$20,000</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  )
}

