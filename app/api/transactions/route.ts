import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, description, date, type } = body

    // Validate input
    if (!amount || !description || !date || !type) {
      return NextResponse.json({ message: "缺少必要欄位" }, { status: 400 })
    }

    // Convert amount to number
    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum)) {
      return NextResponse.json({ message: "金額必須為數字" }, { status: 400 })
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        amount: amountNum,
        description,
        date: new Date(date),
        type,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ message: "建立交易時發生錯誤" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ message: "獲取交易資料時發生錯誤" }, { status: 500 })
  }
}

