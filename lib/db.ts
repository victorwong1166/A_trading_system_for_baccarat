import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// 配置 neon
neonConfig.fetchConnectionCache = true

// 使用環境變量中的數據庫連接字符串
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  ""

// 創建 postgres 客戶端
const client = postgres(connectionString)

// 創建 drizzle 實例
export const db = drizzle(client, { schema })

// 如果沒有連接字符串，記錄警告
if (!connectionString) {
  console.warn("No database connection string found in environment variables")
}

// 創建 neon SQL 客戶端
const sql = connectionString ? neon(connectionString) : neon("") // 空字符串作為後備，但這會在實際使用時失敗

// 添加 raw 方法，用於執行原始 SQL
sql.raw = (query) => ({
  strings: [query],
  values: [],
})

// 添加 identifier 方法，用於安全地引用表名和列名
sql.identifier = (name) => ({
  strings: [`"${name}"`],
  values: [],
})

// 導出 SQL 客戶端
export default sql

// 同時導出為 db，以便與現有代碼兼容
// export const db = sql // Commenting out the original db export

// 導出測試連接的函數
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`
    return {
      connected: true,
      timestamp: result[0]?.now || new Date().toISOString(),
      connectionString: connectionString
        ? `${connectionString.split("@")[0].split(":")[0]}:***@${connectionString.split("@")[1]}`
        : null,
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

