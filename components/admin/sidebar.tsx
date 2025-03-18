"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CreditCard, Settings, Database, FileText, BarChart3 } from "lucide-react"

const sidebarItems = [
  {
    title: "儀表板",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "會員管理",
    href: "/admin/members",
    icon: Users,
  },
  {
    title: "交易記錄",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    title: "報表",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "系統日誌",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    title: "數據庫",
    href: "/admin/database",
    icon: Database,
  },
  {
    title: "系統設置",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <CreditCard className="h-6 w-6" />
          <span>交易系統</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

