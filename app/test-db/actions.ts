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

export async function checkTableStructure() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // 檢查所有表的結構
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    // 獲取每個表的列信息
    const tables = {}
    for (const table of result) {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${table.table_name}
      `
      tables[table.table_name] = columns
    }

    return {
      success: true,
      message: "所有表結構檢查成功",
      tables,
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

    // 使用正確的列名插入數據
    const result = await sql`
      INSERT INTO transactions (
        customer_id, 
        amount, 
        created_at, 
        updated_at, 
        description, 
        customer_name, 
        status, 
        type
      )
      VALUES (
        1, 
        100, 
        NOW(), 
        NOW(), 
        '實際記錄', 
        '實際客戶', 
        '已完成', 
        '實際'
      )
      RETURNING *
    `

    // Revalidate the dashboard page to show the new record
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "記錄添加成功",
      record: result[0],
    }
  } catch (error) {
    console.error("添加記錄失敗:", error)
    return {
      success: false,
      message: "添加記錄失敗",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

