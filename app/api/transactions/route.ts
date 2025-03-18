import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transactions, members } from "@/lib/db/schema"
import { eq, desc, and, gte, lte, sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Filter parameters
    const memberId = searchParams.get("memberId")
    const memberName = searchParams.get("memberName")
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const minAmount = searchParams.get("minAmount")
    const maxAmount = searchParams.get("maxAmount")

    // Build where conditions
    const whereConditions = []

    if (memberId) {
      whereConditions.push(eq(transactions.memberId, memberId))
    }

    if (memberName) {
      // Join with members table to filter by name
      // This is a simplified approach - in a real app, you might want to use a more sophisticated search
    }

    if (type && type !== "all") {
      whereConditions.push(eq(transactions.type, type))
    }

    if (category && category !== "all") {
      // Filter by transaction category
      // This requires joining with a categories table or using a computed field
      // For simplicity, we'll implement a basic version
      const typesInCategory = sql`${transactions.type} IN (
        SELECT type FROM transaction_types WHERE category = ${category}
      )`
      whereConditions.push(typesInCategory)
    }

    if (startDate) {
      whereConditions.push(gte(transactions.createdAt, new Date(startDate)))
    }

    if (endDate) {
      whereConditions.push(lte(transactions.createdAt, new Date(endDate)))
    }

    if (minAmount) {
      whereConditions.push(gte(transactions.amount, Number.parseFloat(minAmount)))
    }

    if (maxAmount) {
      whereConditions.push(lte(transactions.amount, Number.parseFloat(maxAmount)))
    }

    // Combine all conditions
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Get total count for pagination
    const totalCountResult = await db.select({ count: sql`COUNT(*)` }).from(transactions).where(whereClause)

    const totalCount = Number(totalCountResult[0].count)
    const totalPages = Math.ceil(totalCount / limit)

    // Get transactions with pagination
    const query = db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        memberId: transactions.memberId,
        memberName: members.name,
        amount: transactions.amount,
        type: transactions.type,
        status: transactions.status,
        description: transactions.description,
        createdAt: transactions.createdAt,
        balanceBefore: transactions.balanceBefore,
        balanceAfter: transactions.balanceAfter,
      })
      .from(transactions)
      .leftJoin(members, eq(transactions.memberId, members.id))
      .where(whereClause)
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset)

    const results = await query

    // Transform results if needed
    const transformedResults = results.map((transaction) => ({
      ...transaction,
      // Add any computed fields here
    }))

    return NextResponse.json({
      transactions: transformedResults,
      totalCount,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.memberId || !data.amount || !data.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate transaction ID
    const transactionId = `TX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`

    // Get member current balance
    const memberResult = await db
      .select({ balance: members.balance })
      .from(members)
      .where(eq(members.id, data.memberId))

    if (memberResult.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const currentBalance = memberResult[0].balance

    // Calculate new balance based on transaction type
    let newBalance = currentBalance

    switch (data.type) {
      case "buy":
      case "sign":
        newBalance += data.amount
        break
      case "redeem":
      case "return":
        newBalance -= data.amount
        break
      case "deposit":
        newBalance += data.amount
        break
      case "withdrawal":
        newBalance -= data.amount
        break
      // Handle other transaction types as needed
    }

    // Start a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // Insert transaction record
      const [transaction] = await tx
        .insert(transactions)
        .values({
          transactionId,
          memberId: data.memberId,
          amount: data.amount,
          type: data.type,
          status: "active",
          description: data.description || "",
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          createdBy: session.user?.email || "system",
        })
        .returning()

      // Update member balance
      await tx.update(members).set({ balance: newBalance }).where(eq(members.id, data.memberId))

      return transaction
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

// 取消交易
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { transactionId, cancelReason } = body

    if (!transactionId || !cancelReason) {
      return NextResponse.json({ error: "Transaction ID and cancel reason are required" }, { status: 400 })
    }

    // 查詢交易
    const transaction = await db.query.transactions.findFirst({
      where: (transactions, { eq }) => eq(transactions.transactionId, transactionId),
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.status === "canceled") {
      return NextResponse.json({ error: "Transaction already canceled" }, { status: 400 })
    }

    // 如果交易關聯會員，恢復會員餘額
    if (transaction.memberId) {
      const member = await db.query.members.findFirst({
        where: (members, { eq }) => eq(members.id, transaction.memberId),
      })

      if (member) {
        const newBalance =
          Number.parseFloat(member.balance.toString()) - Number.parseFloat(transaction.amount.toString())

        await db
          .update(members)
          .set({
            balance: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(members.id, member.id))
      }
    }

    // 更新交易狀態
    const updatedTransaction = await db
      .update(transactions)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        canceledBy: session.user.id,
        cancelReason,
      })
      .where(eq(transactions.id, transaction.id))
      .returning()

    return NextResponse.json(updatedTransaction[0])
  } catch (error) {
    console.error("Error canceling transaction:", error)
    return NextResponse.json({ error: "Failed to cancel transaction" }, { status: 500 })
  }
}

