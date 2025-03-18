import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, transactions } from "@/lib/db/schema"
import { eq, and, gte, sql } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CreditCard, DollarSign, Activity } from "lucide-react"
import TransactionList from "@/components/transaction-list"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // 獲取今天的日期
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 獲取會員總數
  const membersCount = await db.select({ count: db.fn.count() }).from(members).where(eq(members.isDeleted, false))

  // 獲取今日交易總數
  const todayTransactionsCount = await db
    .select({ count: db.fn.count() })
    .from(transactions)
    .where(gte(transactions.createdAt, today))

  // 獲取今日交易總額
  const todayTransactionsAmount = await db
    .select({
      total: sql<number>`COALESCE(SUM(amount), 0)`,
    })
    .from(transactions)
    .where(and(gte(transactions.createdAt, today), eq(transactions.status, "active")))

  // 獲取會員總餘額
  const totalBalance = await db
    .select({
      total: sql<number>`COALESCE(SUM(balance), 0)`,
    })
    .from(members)
    .where(eq(members.isDeleted, false))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">儀表板</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">會員總數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersCount[0].count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日交易數</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactionsCount[0].count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日交易額</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactionsAmount[0].total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">會員總餘額</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBalance[0].total.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">今日交易</TabsTrigger>
          <TabsTrigger value="all">所有交易</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <TransactionList showOnlyToday={true} />
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          <TransactionList showAllTypes={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

