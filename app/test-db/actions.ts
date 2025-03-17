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

// 新增函數來檢查表結構
export async function checkTableStructure() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // 檢查 transactions 表的結構
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `

    return {
      success: true,
      message: "表結構檢查成功",
      columns: result,
    }
  } catch (error) {
    console.error("表結構檢查失敗:", error)
    return {
      success: false,
      message: "表結構檢查失敗",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function addTestRecord() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // 使用更通用的插入方式，不指定具體的列名
    // 我們會根據檢查表結構的結果來更新這個函數
    const result = await sql`
      INSERT INTO transactions (game_type, table_number, amount, note, created_at)
      VALUES ('Test', '測試', 100, '測試記錄', NOW())
      RETURNING *
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

