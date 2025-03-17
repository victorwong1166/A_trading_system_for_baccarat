import { type NextRequest, NextResponse } from "next/server"
import { getMemberByMemberId, getMemberTransactions, getMemberDebt } from "@/lib/member-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const memberId = params.id

    // 檢查會員是否存在
    const member = await getMemberByMemberId(memberId)
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // 獲取會員交易記錄
    const transactions = await getMemberTransactions(memberId)

    // 獲取會員總結欠
    const totalDebt = await getMemberDebt(memberId)

    return NextResponse.json({
      member,
      transactions,
      totalDebt,
    })
  } catch (error) {
    console.error(`Error in GET /api/members/${params.id}/transactions:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

