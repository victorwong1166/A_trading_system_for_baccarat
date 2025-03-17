import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// 配置 neon
neonConfig.fetchOptions = {
  cache: "no-store",
}

// 檢查數據庫連接字符串是否存在
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING

// 創建 SQL 客戶端
let sql
let db

try {
  if (databaseUrl) {
    sql = neon(databaseUrl)
    db = drizzle(sql)
    console.log("Database connection initialized successfully")
  } else {
    console.warn("No database connection string provided")
  }
} catch (error) {
  console.error("Database connection initialization failed:", error)
}

// 檢查數據庫是否可用
export function isDatabaseAvailable() {
  return !!db && !!sql
}

// 導出 SQL 客戶端和 Drizzle 實例
export default sql
export { db }

