import { NextResponse } from "next/server"
import {
  getCashBalance,
  updateCashBalance,
  processBuyChips,
  processRedeemChips,
  getCashTransactionHistory,
  getCashSummary,
  initializeCashAccount,
} from "@/lib/cash-service"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "balance"

    // 獲取現金餘額
    if (action === "balance") {
      const result = await getCashBalance()
      return NextResponse.json(result)
    }

    // 獲取交易歷史
    if (action === "history") {
      const limit = Number.parseInt(searchParams.get("limit") || "20")
      const offset = Number.parseInt(searchParams.get("offset") || "0")
      const result = await getCashTransactionHistory(limit, offset)
      return NextResponse.json(result)
    }

    // 獲取現金摘要
    if (action === "summary") {
      const result = await getCashSummary()
      return NextResponse.json(result)
    }

    // 初始化現金賬戶
    if (action === "initialize") {
      const result = await initializeCashAccount()
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "未知操作" }, { status: 400 })
  } catch (error) {
    console.error("處理現金API請求失敗:", error)
    return NextResponse.json({ success: false, error: error.message || "處理請求失敗" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const { action, amount, transactionId, notes, userId } = data

    // 買碼交易 - 增加現金
    if (action === "buy_chips") {
      const result = await processBuyChips(amount, transactionId, notes, userId)
      return NextResponse.json(result)
    }

    // 兌碼交易 - 減少現金
    if (action === "redeem_chips") {
      const result = await processRedeemChips(amount, transactionId, notes, userId)
      return NextResponse.json(result)
    }

    // 直接更新餘額
    if (action === "update_balance") {
      const result = await updateCashBalance(amount, transactionId, data.type || "manual", notes, userId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "未知操作" }, { status: 400 })
  } catch (error) {
    console.error("處理現金API請求失敗:", error)
    return NextResponse.json({ success: false, error: error.message || "處理請求失敗" }, { status: 500 })
  }
}

