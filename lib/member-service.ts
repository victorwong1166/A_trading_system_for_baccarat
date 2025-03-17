import { db } from "@/lib/db"
import { members, transactions, transactionRecords } from "@/lib/schema"
import { eq, desc, and, like, sql } from "drizzle-orm"

export type MemberFormData = {
  memberId?: string
  name: string
  phone?: string
  email?: string
  address?: string
  type: "shareholder" | "agent" | "regular"
  agentId?: number | null
  notes?: string
}

export type MemberWithDebt = {
  id: number
  memberId: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  type: "shareholder" | "agent" | "regular"
  agentId: number | null
  notes: string | null
  createdBy: number
  createdAt: Date
  updatedAt: Date
  totalDebt: number
}

export async function getAllMembers() {
  try {
    const result = await db.select().from(members).orderBy(desc(members.createdAt))
    return result
  } catch (error) {
    console.error("Error fetching members:", error)
    throw new Error("Failed to fetch members")
  }
}

export async function getMembersWithDebt() {
  try {
    // 使用SQL子查詢計算每個會員的總結欠
    const result = await db
      .select({
        ...members,
        totalDebt: sql<number>`COALESCE(
          (SELECT SUM(amount) FROM ${transactionRecords} 
           WHERE ${transactionRecords.memberId} = ${members.memberId} 
           AND ${transactionRecords.status} = 'active'
           AND ${transactionRecords.transactionType} IN ('sign_table', 'credit')
          ), 0
        ) - COALESCE(
          (SELECT SUM(amount) FROM ${transactionRecords} 
           WHERE ${transactionRecords.memberId} = ${members.memberId} 
           AND ${transactionRecords.status} = 'active'
           AND ${transactionRecords.transactionType} IN ('return_payment')
          ), 0
        )`,
      })
      .from(members)
      .orderBy(desc(members.createdAt))

    return result as MemberWithDebt[]
  } catch (error) {
    console.error("Error fetching members with debt:", error)
    throw new Error("Failed to fetch members with debt")
  }
}

export async function searchMembers(query: string) {
  try {
    const result = await db
      .select()
      .from(members)
      .where(
        and(
          like(members.memberId, `%${query}%`),
          like(members.name, `%${query}%`),
          like(members.phone || "", `%${query}%`),
        ),
      )
      .orderBy(desc(members.createdAt))
    return result
  } catch (error) {
    console.error("Error searching members:", error)
    throw new Error("Failed to search members")
  }
}

export async function getMemberById(id: number) {
  try {
    const result = await db.select().from(members).where(eq(members.id, id))
    return result[0] || null
  } catch (error) {
    console.error(`Error fetching member with ID ${id}:`, error)
    throw new Error("Failed to fetch member")
  }
}

export async function getMemberByMemberId(memberId: string) {
  try {
    const result = await db.select().from(members).where(eq(members.memberId, memberId))
    return result[0] || null
  } catch (error) {
    console.error(`Error fetching member with member ID ${memberId}:`, error)
    throw new Error("Failed to fetch member")
  }
}

export async function createMember(data: MemberFormData, userId: number) {
  try {
    // 生成唯一會員ID (如果沒有提供)
    const memberId = data.memberId || generateMemberId()

    const result = await db
      .insert(members)
      .values({
        memberId,
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        type: data.type,
        agentId: data.agentId || null,
        notes: data.notes || null,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error creating member:", error)
    throw new Error("Failed to create member")
  }
}

export async function updateMember(id: number, data: MemberFormData) {
  try {
    const result = await db
      .update(members)
      .set({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        type: data.type,
        agentId: data.agentId || null,
        notes: data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning()

    return result[0]
  } catch (error) {
    console.error(`Error updating member with ID ${id}:`, error)
    throw new Error("Failed to update member")
  }
}

export async function deleteMember(id: number) {
  try {
    // 檢查會員是否有關聯的交易記錄
    const memberTransactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(eq(transactions.memberId, id))

    if (memberTransactions[0].count > 0) {
      throw new Error("Cannot delete member with associated transactions")
    }

    const result = await db.delete(members).where(eq(members.id, id)).returning()
    return result[0]
  } catch (error) {
    console.error(`Error deleting member with ID ${id}:`, error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete member")
  }
}

export async function getMemberTransactions(memberId: string) {
  try {
    const result = await db
      .select()
      .from(transactionRecords)
      .where(eq(transactionRecords.memberId, memberId))
      .orderBy(desc(transactionRecords.createdAt))

    return result
  } catch (error) {
    console.error(`Error fetching transactions for member ${memberId}:`, error)
    throw new Error("Failed to fetch member transactions")
  }
}

export async function getMemberDebt(memberId: string) {
  try {
    // 計算會員的總結欠 (簽單和信用交易減去還款)
    const debtTransactions = await db
      .select({
        totalDebt: sql<number>`COALESCE(
          SUM(CASE WHEN ${transactionRecords.transactionType} IN ('sign_table', 'credit') THEN ${transactionRecords.amount} ELSE 0 END) -
          SUM(CASE WHEN ${transactionRecords.transactionType} = 'return_payment' THEN ${transactionRecords.amount} ELSE 0 END),
          0
        )`,
      })
      .from(transactionRecords)
      .where(and(eq(transactionRecords.memberId, memberId), eq(transactionRecords.status, "active")))

    return debtTransactions[0]?.totalDebt || 0
  } catch (error) {
    console.error(`Error calculating debt for member ${memberId}:`, error)
    throw new Error("Failed to calculate member debt")
  }
}

// 生成唯一會員ID (格式: M + 年份後兩位 + 5位數字)
function generateMemberId() {
  const year = new Date().getFullYear().toString().slice(-2)
  const randomPart = Math.floor(10000 + Math.random() * 90000).toString()
  return `M${year}${randomPart}`
}

// 獲取所有代理會員 (用於選擇上級代理)
export async function getAllAgents() {
  try {
    const result = await db.select().from(members).where(eq(members.type, "agent")).orderBy(members.name)
    return result
  } catch (error) {
    console.error("Error fetching agents:", error)
    throw new Error("Failed to fetch agents")
  }
}

