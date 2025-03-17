import postgres from "postgres"

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

// 創建 SQL 客戶端
const sql = connectionString
  ? postgres(connectionString, {
      ssl: { rejectUnauthorized: false }, // 允許自簽名證書
      max: 10, // 連接池大小
      idle_timeout: 20, // 空閒連接超時（秒）
      connect_timeout: 10, // 連接超時（秒）
    })
  : postgres("") // 空字符串作為後備，但這會在實際使用時失敗

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
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

