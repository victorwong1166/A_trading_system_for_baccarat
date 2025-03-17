import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    // 檢查表是否存在
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const existingTables = tablesResult.map((row) => row.table_name)
    console.log("Existing tables:", existingTables)

    // 創建必要的表（如果不存在）
    if (!existingTables.includes("transactions")) {
      await sql`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER,
          customer_name TEXT,
          amount DECIMAL(10, 2),
          type TEXT,
          description TEXT,
          status TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("Created transactions table")
    }

    if (!existingTables.includes("debts")) {
      await sql`
        CREATE TABLE IF NOT EXISTS debts (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER,
          customer_name TEXT,
          amount DECIMAL(10, 2),
          description TEXT,
          paid BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("Created debts table")
    }

    if (!existingTables.includes("settlements")) {
      await sql`
        CREATE TABLE IF NOT EXISTS settlements (
          id SERIAL PRIMARY KEY,
          settlement_id TEXT UNIQUE,
          period_number INTEGER,
          date DATE,
          total_revenue DECIMAL(10, 2),
          total_expenses DECIMAL(10, 2),
          net_profit DECIMAL(10, 2),
          notes TEXT,
          created_by INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("Created settlements table")
    }

    // 添加一些測試數據（如果表是空的）
    const transactionCount = await sql`SELECT COUNT(*) as count FROM transactions`
    if (Number.parseInt(transactionCount[0].count) === 0) {
      await sql`
        INSERT INTO transactions (customer_name, amount, type, description, status)
        VALUES 
          ('張三', 1000, '存款', '晚場存款', '已完成'),
          ('李四', 2000, '取款', '晚場取款', '已完成'),
          ('王五', 1500, '簽碼', '晚場簽碼', '待處理')
      `
      console.log("Added sample transactions")
    }

    const debtCount = await sql`SELECT COUNT(*) as count FROM debts`
    if (Number.parseInt(debtCount[0].count) === 0) {
      await sql`
        INSERT INTO debts (customer_name, amount, description, paid)
        VALUES 
          ('張三', 1000, '晚場借款', FALSE),
          ('李四', 2000, '晚場借款', FALSE)
      `
      console.log("Added sample debts")
    }

    return NextResponse.json({
      success: true,
      message: "數據庫初始化成功",
      tables: {
        created: existingTables.length,
        names: existingTables,
      },
    })
  } catch (error) {
    console.error("數據庫初始化錯誤:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

