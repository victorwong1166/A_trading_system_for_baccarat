import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, DollarSign, Activity, TrendingUp, AlertCircle } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

function StatsCard({ title, value, description, icon, trend, trendValue }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && trendValue && (
          <div className="flex items-center pt-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : trend === "down" ? (
              <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
            ) : (
              <Activity className="h-4 w-4 text-yellow-500 mr-1" />
            )}
            <span
              className={`text-xs ${
                trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-yellow-500"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  stats: {
    memberCount: number
    transactionCount: number
    totalRevenue: string
    todayTransactions: number
    todayRevenue: string
    totalDebt: string
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="會員總數"
        value={stats.memberCount}
        icon={<Users className="h-4 w-4" />}
        description="系統註冊會員總數"
      />
      <StatsCard
        title="交易總數"
        value={stats.transactionCount}
        icon={<CreditCard className="h-4 w-4" />}
        description="所有已完成交易"
      />
      <StatsCard
        title="總營業額"
        value={stats.totalRevenue}
        icon={<DollarSign className="h-4 w-4" />}
        description="所有已完成交易金額"
      />
      <StatsCard
        title="今日交易"
        value={stats.todayTransactions}
        icon={<Activity className="h-4 w-4" />}
        description="今日交易筆數"
      />
      <StatsCard
        title="今日營業額"
        value={stats.todayRevenue}
        icon={<TrendingUp className="h-4 w-4" />}
        description="今日交易金額"
      />
      <StatsCard
        title="會員結欠總額"
        value={stats.totalDebt}
        icon={<AlertCircle className="h-4 w-4" />}
        description="所有會員未結清金額"
      />
    </div>
  )
}

