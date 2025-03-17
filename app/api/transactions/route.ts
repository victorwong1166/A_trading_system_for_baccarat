import { NextResponse } from "next/server"
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  cancelTransaction,
  getTransactionStats,
} from "@/lib/transaction-service"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get("recordId")

    // 獲取單個交易記錄
    if (recordId) {
      const result = await getTransactionById(recordId)
      return NextResponse.json(result)
    }

    // 獲取交易統計
    if (searchParams.get("stats") === "true") {
      const filters = {}

      if (searchParams.get("memberId")) {
        filters.memberId = searchParams.get("memberId")
      }

      if (searchParams.get("transactionType")) {
        filters.transactionType = searchParams.get("transactionType")
      }

      if (searchParams.get("startDate")) {
        filters.startDate = searchParams.get("startDate")
      }

      if (searchParams.get("endDate")) {
        filters.endDate = searchParams.get("endDate")
      }

      const result = await getTransactionStats(filters)
      return NextResponse.json(result)
    }

    // 獲取交易列表
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const filters = {}

    if (searchParams.get("memberId")) {
      filters.memberId = searchParams.get("memberId")
    }

    if (searchParams.get("transactionType")) {
      filters.transactionType = searchParams.get("transactionType")
    }

    if (searchParams.get("status")) {
      filters.status = searchParams.get("status")
    }

    if (searchParams.get("startDate")) {
      filters.startDate = searchParams.get("startDate")
    }

    if (searchParams.get("endDate")) {
      filters.endDate = searchParams.get("endDate")
    }

    const result = await getTransactions(limit, offset, filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error("處理交易API請求失敗:", error)
    return NextResponse.json({ success: false, error: error.message || "處理請求失敗" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // 創建新交易
    const result = await createTransaction(data)

    return NextResponse.json(result)
  } catch (error) {
    console.error("創建交易失敗:", error)
    return NextResponse.json({ success: false, error: error.message || "創建交易失敗" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const data = await request.json()
    const { recordId, ...updateData } = data

    if (!recordId) {
      return NextResponse.json({ success: false, error: "缺少交易ID" }, { status: 400 })
    }

    // 取消交易
    if (data.action === "cancel") {
      const result = await cancelTransaction(recordId, {
        canceledBy: data.canceledBy,
        cancelReason: data.cancelReason,
      })
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "不支持的操作" }, { status: 400 })
  } catch (error) {
    console.error("更新交易失敗:", error)
    return NextResponse.json({ success: false, error: error.message || "更新交易失敗" }, { status: 500 })
  }
}

