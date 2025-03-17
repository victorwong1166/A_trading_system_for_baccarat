import { db } from "./db"
import { members, transactions, users, settings } from "./schema"
import { eq, desc, and, sql, count, sum } from "drizzle-orm"
import { formatCurrency } from "./utils"

// 系統概覽統計
export async function getDashboardStats() {
  // 會員總數
  const memberCount = await db.select({ count: count() }).from(members).where(eq(members.isDeleted, false))

  // 交易總數
  const transactionCount = await db.select({ count: count() }).from(transactions)

  // 總營業額
  const totalRevenue = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(eq(transactions.status, "completed"))

  // 今日交易數
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTransactions = await db
    .select({ count: count() })
    .from(transactions)
    .where(and(sql`DATE(${transactions.createdAt}) = DATE(${today})`, eq(transactions.status, "completed")))

  // 今日營業額
  const todayRevenue = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(sql`DATE(${transactions.createdAt}) = DATE(${today})`, eq(transactions.status, "completed")))

  // 會員結欠總額
  const totalDebt = await db
    .select({ total: sum(members.balance) })
    .from(members)
    .where(eq(members.isDeleted, false))

  return {
    memberCount: memberCount[0]?.count || 0,
    transactionCount: transactionCount[0]?.count || 0,
    totalRevenue: formatCurrency(totalRevenue[0]?.total || 0),
    todayTransactions: todayTransactions[0]?.count || 0,
    todayRevenue: formatCurrency(todayRevenue[0]?.total || 0),
    totalDebt: formatCurrency(totalDebt[0]?.total || 0),
  }
}

// 獲取最近交易
export async function getRecentTransactions(limit = 5) {
  const recentTransactions = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      status: transactions.status,
      createdAt: transactions.createdAt,
      memberId: transactions.memberId,
      memberName: members.name,
    })
    .from(transactions)
    .leftJoin(members, eq(transactions.memberId, members.id))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)

  return recentTransactions.map((tx) => ({
    ...tx,
    amount: formatCurrency(tx.amount),
    createdAt: tx.createdAt.toLocaleString(),
  }))
}

// 獲取系統用戶
export async function getSystemUsers() {
  return db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      lastLogin: users.lastLogin,
      isActive: users.isActive,
    })
    .from(users)
    .orderBy(users.username)
}

// 創建系統用戶
export async function createSystemUser(userData: {
  username: string
  password: string
  name: string
  role: string
}) {
  // 在實際應用中，應該對密碼進行加密
  // 這裡簡化處理，實際應用請使用 bcrypt 等庫
  return db
    .insert(users)
    .values({
      username: userData.username,
      password: userData.password, // 應該加密
      name: userData.name,
      role: userData.role,
      isActive: true,
    })
    .returning()
}

// 更新系統用戶
export async function updateSystemUser(
  id: string,
  userData: {
    name?: string
    role?: string
    isActive?: boolean
    password?: string
  },
) {
  return db.update(users).set(userData).where(eq(users.id, id)).returning()
}

// 獲取系統設置
export async function getSystemSettings() {
  return db.select().from(settings)
}

// 更新系統設置
export async function updateSystemSetting(key: string, value: string) {
  return db.update(settings).set({ value }).where(eq(settings.key, key)).returning()
}

// 獲取系統日誌
export async function getSystemLogs(limit = 100) {
  // 假設我們有一個系統日誌表
  // 這裡簡化返回一些模擬數據
  return [
    { id: "1", action: "用戶登入", user: "admin", timestamp: new Date().toISOString(), details: "管理員登入系統" },
    {
      id: "2",
      action: "新增會員",
      user: "admin",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: "新增會員 #M001",
    },
    {
      id: "3",
      action: "系統設置更新",
      user: "admin",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: "更新系統設置: 交易費率",
    },
  ]
}

