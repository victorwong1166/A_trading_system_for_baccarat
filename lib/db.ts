import { neon, neonConfig } from "@neondatabase/serverless"

// 配置 neon
neonConfig.fetchConnectionCache = true

// 確定使用哪個環境變數
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING

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
export const db = sql

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

