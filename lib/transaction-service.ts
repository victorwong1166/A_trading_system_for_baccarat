import { db } from "./db-connect"
import { transactionRecords } from "./schema"
import { eq, desc, and, sql } from "drizzle-orm"

// 創建交易記錄
export async function createTransaction(data) {
  try {
    const recordId = `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const newTransaction = {
      recordId,
      transactionType: data.transactionType,
      memberId: data.memberId || null,
      memberName: data.memberName || null,
      amount: data.amount,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      description: data.description || null,
      status: "active",
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.insert(transactionRecords).values(newTransaction).returning()

    return {
      success: true,
      transaction: result[0],
    }
  } catch (error) {
    console.error("創建交易記錄失敗:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// 獲取交易記錄列表
export async function getTransactions(limit = 50, offset = 0, filters = {}) {
  try {
    let query = db.select().from(transactionRecords).orderBy(desc(transactionRecords.createdAt))

    // 應用過濾條件
    if (filters.memberId) {
      query = query.where(eq(transactionRecords.memberId, filters.memberId))
    }

    if (filters.transactionType) {
      query = query.where(eq(transactionRecords.transactionType, filters.transactionType))
    }

    if (filters.status) {
      query = query.where(eq(transactionRecords.status, filters.status))
    }

    if (filters.startDate && filters.endDate) {
      query = query.where(
        and(
          sql`${transactionRecords.createdAt} >= ${new Date(filters.startDate)}`,
          sql`${transactionRecords.createdAt} <= ${new Date(filters.endDate)}`,
        ),
      )
    }

    // 獲取總記錄數
    const countQuery = db.select({ count: sql`count(*)` }).from(transactionRecords)
    const countResult = await countQuery.execute()
    const totalCount = Number(countResult[0].count)

    // 應用分頁
    query = query.limit(limit).offset(offset)

    const transactions = await query.execute()

    return {
      success: true,
      transactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + transactions.length < totalCount,
      },
    }
  } catch (error) {
    console.error("獲取交易記錄失敗:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// 獲取單個交易記錄
export async function getTransactionById(recordId) {
  try {
    const transaction = await db
      .select()
      .from(transactionRecords)
      .where(eq(transactionRecords.recordId, recordId))
      .execute()

    if (transaction.length === 0) {
      return {
        success: false,
        error: "交易記錄不存在",
      }
    }

    return {
      success: true,
      transaction: transaction[0],
    }
  } catch (error) {
    console.error("獲取交易記錄失敗:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// 取消交易
export async function cancelTransaction(recordId, cancelData) {
  try {
    // 檢查交易是否存在
    const existingTransaction = await db
      .select()
      .from(transactionRecords)
      .where(eq(transactionRecords.recordId, recordId))
      .execute()

    if (existingTransaction.length === 0) {
      return {
        success: false,
        error: "交易記錄不存在",
      }
    }

    // 檢查交易是否已經被取消
    if (existingTransaction[0].status === "canceled") {
      return {
        success: false,
        error: "交易已經被取消",
      }
    }

    // 更新交易狀態
    const updatedTransaction = await db
      .update(transactionRecords)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        canceledBy: cancelData.canceledBy,
        cancelReason: cancelData.cancelReason || "用戶取消",
        updatedAt: new Date(),
      })
      .where(eq(transactionRecords.recordId, recordId))
      .returning()

    return {
      success: true,
      transaction: updatedTransaction[0],
    }
  } catch (error) {
    console.error("取消交易失敗:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// 獲取交易統計
export async function getTransactionStats(filters = {}) {
  try {
    // 構建基本查詢
    let baseQuery = db.select().from(transactionRecords)

    // 應用過濾條件
    if (filters.memberId) {
      baseQuery = baseQuery.where(eq(transactionRecords.memberId, filters.memberId))
    }

    if (filters.transactionType) {
      baseQuery = baseQuery.where(eq(transactionRecords.transactionType, filters.transactionType))
    }

    if (filters.startDate && filters.endDate) {
      baseQuery = baseQuery.where(
        and(
          sql`${transactionRecords.createdAt} >= ${new Date(filters.startDate)}`,
          sql`${transactionRecords.createdAt} <= ${new Date(filters.endDate)}`,
        ),
      )
    }

    // 只計算活躍交易
    baseQuery = baseQuery.where(eq(transactionRecords.status, "active"))

    // 獲取總交易數
    const countQuery = db
      .select({ count: sql`count(*)` })
      .from(transactionRecords)
      .where(eq(transactionRecords.status, "active"))
    const countResult = await countQuery.execute()
    const totalCount = Number(countResult[0].count)

    // 獲取總金額
    const sumQuery = db
      .select({
        totalAmount: sql`sum(amount)`,
      })
      .from(transactionRecords)
      .where(eq(transactionRecords.status, "active"))
    const sumResult = await sumQuery.execute()
    const totalAmount = Number(sumResult[0].totalAmount || 0)

    // 獲取按類型分組的統計
    const typeStatsQuery = db
      .select({
        transactionType: transactionRecords.transactionType,
        count: sql`count(*)`,
        totalAmount: sql`sum(amount)`,
      })
      .from(transactionRecords)
      .where(eq(transactionRecords.status, "active"))
      .groupBy(transactionRecords.transactionType)

    const typeStats = await typeStatsQuery.execute()

    return {
      success: true,
      stats: {
        totalCount,
        totalAmount,
        typeStats,
      },
    }
  } catch (error) {
    console.error("獲取交易統計失敗:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

