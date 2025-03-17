import { db } from "./db"
import { members, transactions, users, settings } from "./schema"
import { eq, desc, and, sql, count, sum } from "drizzle-orm"
import { formatCurrency } from "./utils"

// 系統概覽統計
export async function getDashboardStats() {
  try {
    // 會員總數
    const memberCount = await db.select({ count: count() }).from(members).where(eq(members.is_deleted, false))

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
      .where(and(sql`DATE(${transactions.created_at}) = DATE(${today})`, eq(transactions.status, "completed")))

    // 今日營業額
    const todayRevenue = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(sql`DATE(${transactions.created_at}) = DATE(${today})`, eq(transactions.status, "completed")))

    // 會員結欠總額
    const totalDebt = await db
      .select({ total: sum(members.balance) })
      .from(members)
      .where(eq(members.is_deleted, false))

    return {
      memberCount: memberCount[0]?.count || 0,
      transactionCount: transactionCount[0]?.count || 0,
      totalRevenue: formatCurrency(totalRevenue[0]?.total || 0),
      todayTransactions: todayTransactions[0]?.count || 0,
      todayRevenue: formatCurrency(todayRevenue[0]?.total || 0),
      totalDebt: formatCurrency(totalDebt[0]?.total || 0),
    }
  } catch (error) {
    console.error("Error in getDashboardStats:", error)
    // 返回默認值，避免整個應用崩潰
    return {
      memberCount: 0,
      transactionCount: 0,
      totalRevenue: formatCurrency(0),
      todayTransactions: 0,
      todayRevenue: formatCurrency(0),
      totalDebt: formatCurrency(0),
    }
  }
}

// 獲取最近交易
export async function getRecentTransactions(limit = 5) {
  try {
    const recentTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        status: transactions.status,
        createdAt: transactions.created_at,
        memberId: transactions.member_id,
        memberName: members.name,
      })
      .from(transactions)
      .leftJoin(members, eq(transactions.member_id, members.id))
      .orderBy(desc(transactions.created_at))
      .limit(limit)

    return recentTransactions.map((tx) => ({
      ...tx,
      amount: formatCurrency(tx.amount),
      createdAt: tx.createdAt.toLocaleString(),
    }))
  } catch (error) {
    console.error("Error in getRecentTransactions:", error)
    return []
  }
}

// 獲取系統用戶
export async function getSystemUsers() {
  try {
    return db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        lastLogin: users.last_login,
        isActive: users.is_active,
      })
      .from(users)
      .orderBy(users.username)
  } catch (error) {
    console.error("Error in getSystemUsers:", error)
    return []
  }
}

// 創建系統用戶
export async function createSystemUser(userData: {
  username: string
  password: string
  name: string
  role: string
}) {
  try {
    // 在實際應用中，應該對密碼進行加密
    // 這裡簡化處理，實際應用請使用 bcrypt 等庫
    return db
      .insert(users)
      .values({
        username: userData.username,
        password: userData.password, // 應該加密
        name: userData.name,
        role: userData.role as any,
        is_active: true,
      })
      .returning()
  } catch (error) {
    console.error("Error in createSystemUser:", error)
    throw error
  }
}

// 更新系統用戶
export async function updateSystemUser(
  id: string,
  userData: {
    name?: string
    role?: string
    is_active?: boolean
    password?: string
  },
) {
  try {
    return db
      .update(users)
      .set({
        ...userData,
        role: userData.role as any,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning()
  } catch (error) {
    console.error("Error in updateSystemUser:", error)
    throw error
  }
}

// 獲取系統設置
export async function getSystemSettings() {
  try {
    return db.select().from(settings)
  } catch (error) {
    console.error("Error in getSystemSettings:", error)
    return []
  }
}

// 更新系統設置
export async function updateSystemSetting(key: string, value: string, updatedBy?: string) {
  try {
    return db
      .update(settings)
      .set({
        value,
        updated_at: new Date(),
        updated_by: updatedBy,
      })
      .where(eq(settings.key, key))
      .returning()
  } catch (error) {
    console.error("Error in updateSystemSetting:", error)
    throw error
  }
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

