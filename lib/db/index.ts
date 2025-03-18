import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// 檢查環境變量
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

// 創建數據庫連接
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
export const db = drizzle(client, { schema })

// 導出類型
export type Member = typeof schema.members.$inferSelect
export type NewMember = typeof schema.members.$inferInsert
export type Transaction = typeof schema.transactions.$inferSelect
export type NewTransaction = typeof schema.transactions.$inferInsert
export type User = typeof schema.users.$inferSelect
export type NewUser = typeof schema.users.$inferInsert
export type Setting = typeof schema.settings.$inferSelect
export type NewSetting = typeof schema.settings.$inferInsert
export type SystemLog = typeof schema.systemLogs.$inferSelect
export type NewSystemLog = typeof schema.systemLogs.$inferInsert

