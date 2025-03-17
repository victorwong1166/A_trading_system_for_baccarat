import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// 創建數據庫連接
const sql_client = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql_client)

// 測試數據庫連接
export async function testConnection() {
  try {
    const result = await sql_client`SELECT NOW()`
    return { success: true, timestamp: result[0].now }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error: error.message }
  }
}

// 執行原始SQL查詢
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql_client.query(query, params)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error("Query execution error:", error)
    return { success: false, error: error.message }
  }
}

