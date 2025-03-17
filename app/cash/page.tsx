import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard-header"
import CashBalanceDisplay from "@/components/cash-balance-display"
import CashTransactionHistory from "@/components/cash-transaction-history"

export const metadata: Metadata = {
  title: "交易系統 - 現金管理",
  description: "交易系統現金管理",
}

export default function CashPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">現金管理</h1>
          <p className="text-gray-500 mt-1">查看現金餘額和交易歷史</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CashBalanceDisplay />

          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="font-medium text-yellow-800">現金管理說明</h3>
              <p className="text-sm text-yellow-700 mt-1">
                本系統會自動追蹤現金變動：買碼交易增加現金，兌碼交易減少現金。
                所有交易都會記錄在交易歷史中，方便查詢和核對。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CashTransactionHistory />
        </div>
      </main>
    </div>
  )
}

