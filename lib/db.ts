import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// 配置 neon
neonConfig.fetchConnectionCache = true

// 使用環境變量中的數據庫連接字符串
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING

// 檢查連接字符串是否存在
if (!connectionString) {
  console.warn(
    "警告: 未找到數據庫連接字符串。請確保設置了以下環境變量之一: DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING",
  )
}

// 創建 SQL 客戶端，使用條件初始化避免在沒有連接字符串時拋出錯誤
const sql = connectionString ? neon(connectionString) : null

// 創建 drizzle 實例，僅在 SQL 客戶端存在時初始化
export const db = sql ? drizzle(sql, { schema }) : null

// 導出 SQL 客戶端
export default sql

// 導出測試連接的函數
export async function testConnection() {
  try {
    if (!sql) {
      return {
        connected: false,
        error: "未設置數據庫連接字符串",
        missingEnvVars: true,
      }
    }

    const result = await sql`SELECT NOW()`
    return {
      connected: true,
      timestamp: result[0]?.now || new Date().toISOString(),
      connectionString: connectionString
        ? `${connectionString.split("@")[0].split(":")[0]}:***@${connectionString.split("@")[1]}`
        : null,
    }
  } catch (error) {
    console.error("數據庫連接錯誤:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// 檢查數據庫是否可用的輔助函數
export function isDatabaseAvailable() {
  return !!sql && !!db
}

