import { db } from "./db-connect"
import { cashAccounts, cashTransactions } from "./schema"
import { sql } from "@vercel/postgres"
import { eq } from "drizzle-orm"

// 初始化現金賬戶
export async function initializeCashAccount() {
  try {
    // 檢查是否已存在現金賬戶
    const existingAccounts = await db.select().from(cashAccounts).limit(1)

    // 如果沒有賬戶，創建一個初始賬戶
    if (!existingAccounts || existingAccounts.length === 0) {
      await db.insert(cashAccounts).values({
        balance: 0,
        lastUpdated: new Date(),
      })
      console.log("已創建初始現金賬戶")
    }

    return { success: true }
  } catch (error) {
    console.error("初始化現金賬戶失敗:", error)
    return { success: false, error: error.message }
  }
}

// 獲取當前現金餘額
export async function getCashBalance() {
  try {
    // 獲取現金賬戶
    const accounts = await db.select().from(cashAccounts).limit(1)

    if (!accounts || accounts.length === 0) {
      // 如果沒有賬戶，初始化一個
      await initializeCashAccount()
      return { success: true, balance: 0 }
    }

    return { success: true, balance: accounts[0].balance }
  } catch (error) {
    console.error("獲取現金餘額失敗:", error)
    return { success: false, error: error.message, balance: 0 }
  }
}

// 更新現金餘額
export async function updateCashBalance(amount: number, transactionId: number, type: string, notes = "", userId = 1) {
  try {
    // 獲取當前餘額
    const { balance } = await getCashBalance()

    // 計算新餘額
    const newBalance = Number(balance) + amount

    // 更新現金賬戶
    await db
      .update(cashAccounts)
      .set({
        balance: newBalance,
        lastUpdated: new Date(),
      })
      .where(eq(cashAccounts.id, 1))

    // 記錄交易
    await db.insert(cashTransactions).values({
      transactionId,
      amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
      type,
      notes,
      createdBy: userId,
      createdAt: new Date(),
    })

    return {
      success: true,
      previousBalance: balance,
      newBalance,
      difference: amount,
    }
  } catch (error) {
    console.error("更新現金餘額失敗:", error)
    return { success: false, error: error.message }
  }
}

// 處理買碼交易 - 增加現金
export async function processBuyChips(amount: number, transactionId: number, notes = "", userId = 1) {
  return updateCashBalance(amount, transactionId, "buy_chips", notes, userId)
}

// 處理兌碼交易 - 減少現金
export async function processRedeemChips(amount: number, transactionId: number, notes = "", userId = 1) {
  // 兌碼是減少現金，所以金額為負數
  return updateCashBalance(-amount, transactionId, "redeem_chips", notes, userId)
}

// 獲取現金交易歷史
export async function getCashTransactionHistory(limit = 20, offset = 0) {
  try {
    const transactions = await db
      .select()
      .from(cashTransactions)
      .orderBy(sql`${cashTransactions.createdAt} DESC`)
      .limit(limit)
      .offset(offset)

    return { success: true, transactions }
  } catch (error) {
    console.error("獲取現金交易歷史失敗:", error)
    return { success: false, error: error.message, transactions: [] }
  }
}

// 獲取現金餘額摘要
export async function getCashSummary() {
  try {
    // 獲取當前餘額
    const { balance } = await getCashBalance()

    // 獲取今日交易總額
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTransactions = await db
      .select({
        totalIn: sql`SUM(CASE WHEN ${cashTransactions.amount} > 0 THEN ${cashTransactions.amount} ELSE 0 END)`,
        totalOut: sql`SUM(CASE WHEN ${cashTransactions.amount} < 0 THEN ABS(${cashTransactions.amount}) ELSE 0 END)`,
        count: sql`COUNT(*)`,
      })
      .from(cashTransactions)
      .where(sql`${cashTransactions.createdAt} >= ${today}`)

    // 獲取最近一筆交易
    const latestTransaction = await db
      .select()
      .from(cashTransactions)
      .orderBy(sql`${cashTransactions.createdAt} DESC`)
      .limit(1)

    return {
      success: true,
      balance,
      todayIn: todayTransactions[0].totalIn || 0,
      todayOut: todayTransactions[0].totalOut || 0,
      todayCount: todayTransactions[0].count || 0,
      latestTransaction: latestTransaction[0] || null,
    }
  } catch (error) {
    console.error("獲取現金摘要失敗:", error)
    return {
      success: false,
      error: error.message,
      balance: 0,
      todayIn: 0,
      todayOut: 0,
      todayCount: 0,
      latestTransaction: null,
    }
  }
}

