import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    // 獲取總交易數
    const totalTransactionsResult = await sql`
      SELECT COUNT(*) as count FROM transactions
    `
    const totalTransactions = Number.parseInt(totalTransactionsResult[0]?.count || "0")

    // 獲取總交易金額
    const totalAmountResult = await sql`
      SELECT SUM(amount) as total FROM transactions
    `
    const totalAmount = Number.parseFloat(totalAmountResult[0]?.total || "0")

    // 獲取待付款項
    const pendingPaymentsResult = await sql`
      SELECT SUM(amount) as total FROM debts WHERE paid = false
    `
    const pendingPayments = Number.parseFloat(pendingPaymentsResult[0]?.total || "0")

    // 獲取今日交易
    const today = new Date().toISOString().split("T")[0]
    const todayTransactionsResult = await sql`
      SELECT COUNT(*) as count FROM transactions 
      WHERE DATE(created_at) = ${today}
    `
    const todayTransactions = Number.parseInt(todayTransactionsResult[0]?.count || "0")

    return NextResponse.json({
      success: true,
      summary: {
        totalTransactions,
        totalAmount,
        pendingPayments,
        todayTransactions,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)

    // 返回模擬數據作為後備
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      summary: {
        totalTransactions: 125,
        totalAmount: 25000,
        pendingPayments: 3500,
        todayTransactions: 12,
      },
    })
  }
}

