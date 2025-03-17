import { NextResponse } from "next/server"
import { getDashboardStats, getRecentTransactions } from "@/lib/admin-service"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const stats = await getDashboardStats()
    const recentTransactions = await getRecentTransactions(5)

    return NextResponse.json({
      stats,
      recentTransactions,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

