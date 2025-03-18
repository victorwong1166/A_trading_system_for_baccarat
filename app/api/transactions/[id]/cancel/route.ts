import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transactions, members } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { reason } = await request.json()

    // Get the transaction
    const transactionResult = await db.select().from(transactions).where(eq(transactions.id, id))

    if (transactionResult.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const transaction = transactionResult[0]

    // Check if transaction is already cancelled
    if (transaction.status !== "active") {
      return NextResponse.json({ error: "Transaction is already cancelled" }, { status: 400 })
    }

    // Get member current balance
    const memberResult = await db
      .select({ balance: members.balance })
      .from(members)
      .where(eq(members.id, transaction.memberId))

    if (memberResult.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const currentBalance = memberResult[0].balance

    // Calculate new balance by reversing the transaction
    let newBalance = currentBalance

    switch (transaction.type) {
      case "buy":
      case "sign":
        newBalance -= transaction.amount
        break
      case "redeem":
      case "return":
        newBalance += transaction.amount
        break
      case "deposit":
        newBalance -= transaction.amount
        break
      case "withdrawal":
        newBalance += transaction.amount
        break
      // Handle other transaction types as needed
    }

    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Update transaction status
      await tx
        .update(transactions)
        .set({
          status: "cancelled",
          cancelReason: reason || "No reason provided",
          cancelledAt: new Date(),
          cancelledBy: session.user?.email || "system",
        })
        .where(eq(transactions.id, id))

      // Update member balance
      await tx.update(members).set({ balance: newBalance }).where(eq(members.id, transaction.memberId))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling transaction:", error)
    return NextResponse.json({ error: "Failed to cancel transaction" }, { status: 500 })
  }
}

