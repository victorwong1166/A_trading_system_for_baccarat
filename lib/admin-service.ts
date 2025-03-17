import { db, isDatabaseAvailable } from "./db"
import sql from "./db"
import { users, systemLogs, systemSettings } from "./schema"
import { eq } from "drizzle-orm"
import { hash } from "bcrypt"

// 獲取儀表板統計數據
export async function getDashboardStats() {
  try {
    if (!isDatabaseAvailable()) {
      return {
        totalMembers: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        activeMembers: 0,
      }
    }

    // 使用原始 SQL 查詢獲取統計數據
    const memberCount = await sql`SELECT COUNT(*) FROM members`
    const transactionCount = await sql`SELECT COUNT(*) FROM transactions`
    const revenueSum = await sql`SELECT SUM(amount) FROM transactions WHERE type = 'income'`
    const activeMembers = await sql`SELECT COUNT(*) FROM members WHERE status = 'active'`

    return {
      totalMembers: Number.parseInt(memberCount[0]?.count || "0"),
      totalTransactions: Number.parseInt(transactionCount[0]?.count || "0"),
      totalRevenue: Number.parseFloat(revenueSum[0]?.sum || "0"),
      activeMembers: Number.parseInt(activeMembers[0]?.count || "0"),
    }
  } catch (error) {
    console.error("獲取儀表板統計數據錯誤:", error)
    return {
      totalMembers: 0,
      totalTransactions: 0,
      totalRevenue: 0,
      activeMembers: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// 獲取最近交易
export async function getRecentTransactions(limit = 5) {
  try {
    if (!isDatabaseAvailable()) {
      return []
    }

    const transactions = await sql`
      SELECT t.*, m.name as member_name
      FROM transactions t
      LEFT JOIN members m ON t.member_id = m.id
      ORDER BY t.created_at DESC
      LIMIT ${limit}
    `

    return transactions.map((t) => ({
      id: t.id,
      memberId: t.member_id,
      memberName: t.member_name,
      amount: Number.parseFloat(t.amount),
      type: t.type,
      status: t.status,
      createdAt: t.created_at,
      description: t.description,
    }))
  } catch (error) {
    console.error("獲取最近交易錯誤:", error)
    return []
  }
}

// 獲取系統用戶
export async function getSystemUsers() {
  try {
    if (!isDatabaseAvailable() || !db) {
      return []
    }

    const allUsers = await db.select().from(users)
    return allUsers.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    }))
  } catch (error) {
    console.error("獲取系統用戶錯誤:", error)
    return []
  }
}

// 獲取單個系統用戶
export async function getSystemUser(id) {
  try {
    if (!isDatabaseAvailable() || !db) {
      return null
    }

    const user = await db.select().from(users).where(eq(users.id, id)).limit(1)
    if (user.length === 0) {
      return null
    }

    return {
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      role: user[0].role,
      isActive: user[0].is_active,
      createdAt: user[0].created_at,
      lastLogin: user[0].last_login,
    }
  } catch (error) {
    console.error("獲取系統用戶錯誤:", error)
    return null
  }
}

// 創建系統用戶
export async function createSystemUser(userData) {
  try {
    if (!isDatabaseAvailable() || !db) {
      throw new Error("數據庫未連接")
    }

    const hashedPassword = await hash(userData.password, 10)
    const result = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      is_active: userData.isActive,
    })

    return { success: true, id: result.insertId }
  } catch (error) {
    console.error("創建系統用戶錯誤:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// 更新系統用戶
export async function updateSystemUser(id, userData) {
  try {
    if (!isDatabaseAvailable() || !db) {
      throw new Error("數據庫未連接")
    }

    const updateData = {
      username: userData.username,
      email: userData.email,
      role: userData.role,
      is_active: userData.isActive,
    }

    // 如果提供了新密碼，則更新密碼
    if (userData.password) {
      updateData.password = await hash(userData.password, 10)
    }

    await db.update(users).set(updateData).where(eq(users.id, id))
    return { success: true }
  } catch (error) {
    console.error("更新系統用戶錯誤:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// 刪除系統用戶
export async function deleteSystemUser(id) {
  try {
    if (!isDatabaseAvailable() || !db) {
      throw new Error("數據庫未連接")
    }

    await db.delete(users).where(eq(users.id, id))
    return { success: true }
  } catch (error) {
    console.error("刪除系統用戶錯誤:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// 獲取系統設置
export async function getSystemSettings() {
  try {
    if (!isDatabaseAvailable() || !db) {
      return {
        general: { siteName: "交易系統", language: "zh-TW" },
        transaction: { defaultCurrency: "HKD", taxRate: 0 },
        member: { requireApproval: false, defaultCreditLimit: 0 },
        security: { sessionTimeout: 30, requireTwoFactor: false },
      }
    }

    const settings = await db.select().from(systemSettings)
    const settingsMap = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      acc[setting.category][setting.key] = setting.value
      return acc
    }, {})

    return {
      general: {
        siteName: settingsMap.general?.siteName || "交易系統",
        language: settingsMap.general?.language || "zh-TW",
      },
      transaction: {
        defaultCurrency: settingsMap.transaction?.defaultCurrency || "HKD",
        taxRate: Number.parseFloat(settingsMap.transaction?.taxRate || "0"),
      },
      member: {
        requireApproval: settingsMap.member?.requireApproval === "true",
        defaultCreditLimit: Number.parseFloat(settingsMap.member?.defaultCreditLimit || "0"),
      },
      security: {
        sessionTimeout: Number.parseInt(settingsMap.security?.sessionTimeout || "30"),
        requireTwoFactor: settingsMap.security?.requireTwoFactor === "true",
      },
    }
  } catch (error) {
    console.error("獲取系統設置錯誤:", error)
    return {
      general: { siteName: "交易系統", language: "zh-TW" },
      transaction: { defaultCurrency: "HKD", taxRate: 0 },
      member: { requireApproval: false, defaultCreditLimit: 0 },
      security: { sessionTimeout: 30, requireTwoFactor: false },
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// 更新系統設置
export async function updateSystemSettings(settingsData) {
  try {
    if (!isDatabaseAvailable() || !db) {
      throw new Error("數據庫未連接")
    }

    // 將設置數據轉換為數據庫格式
    const settingsToUpdate = []
    for (const category in settingsData) {
      for (const key in settingsData[category]) {
        settingsToUpdate.push({
          category,
          key,
          value: String(settingsData[category][key]),
        })
      }
    }

    // 使用事務更新設置
    await db.transaction(async (tx) => {
      for (const setting of settingsToUpdate) {
        await tx
          .insert(systemSettings)
          .values(setting)
          .onConflictDoUpdate({
            target: [systemSettings.category, systemSettings.key],
            set: { value: setting.value },
          })
      }
    })

    return { success: true }
  } catch (error) {
    console.error("更新系統設置錯誤:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// 獲取系統日誌
export async function getSystemLogs(limit = 100) {
  try {
    if (!isDatabaseAvailable() || !db) {
      return []
    }

    const logs = await db.select().from(systemLogs).orderBy(systemLogs.created_at, "desc").limit(limit)

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      userId: log.user_id,
      username: log.username,
      details: log.details,
      ipAddress: log.ip_address,
      createdAt: log.created_at,
    }))
  } catch (error) {
    console.error("獲取系統日誌錯誤:", error)
    return []
  }
}

// 添加系統日誌
export async function addSystemLog(logData) {
  try {
    if (!isDatabaseAvailable() || !db) {
      console.warn("數據庫未連接，無法記錄系統日誌")
      return { success: false, error: "數據庫未連接" }
    }

    await db.insert(systemLogs).values({
      action: logData.action,
      user_id: logData.userId,
      username: logData.username,
      details: logData.details,
      ip_address: logData.ipAddress,
    })

    return { success: true }
  } catch (error) {
    console.error("添加系統日誌錯誤:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

