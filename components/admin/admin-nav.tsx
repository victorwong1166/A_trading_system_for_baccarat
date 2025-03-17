"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Settings, FileText, Database, CreditCard, BarChart4 } from "lucide-react"

const navItems = [
  {
    title: "儀表板",
    href: "/admin",
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
    title: "報表統計",
    href: "/admin/reports",
    icon: BarChart4,
  },
  {
    title: "系統用戶",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "系統設置",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "系統日誌",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    title: "數據庫連接",
    href: "/admin/database",
    icon: Database,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

