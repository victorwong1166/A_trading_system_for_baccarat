"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

export async function testDatabaseConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Test query
    const result = await sql`SELECT NOW() as time`

    return {
      success: true,
      message: "數據庫連接成功",
      time: result[0].time,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlLength: process.env.DATABASE_URL?.length || 0,
      },
    }
  } catch (error) {
    console.error("數據庫連接測試失敗:", error)
    return {
      success: false,
      message: "數據庫連接失敗",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function addTestRecord() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Try to insert a test record into the transactions table
    const result = await sql`
      INSERT INTO transactions (date, game_type, table_number, amount, note, created_at)
      VALUES (NOW(), 'Test', '測試', 100, '測試記錄', NOW())
      RETURNING id, date, game_type, table_number, amount
    `

    // Revalidate the dashboard page to show the new record
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "測試記錄添加成功",
      record: result[0],
    }
  } catch (error) {
    console.error("添加測試記錄失敗:", error)
    return {
      success: false,
      message: "添加測試記錄失敗",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

