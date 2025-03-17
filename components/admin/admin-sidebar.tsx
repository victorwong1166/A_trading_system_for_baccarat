"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Settings, Database, Server, Globe, MessageSquare } from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      title: "儀表板",
      exact: true,
    },
    {
      href: "/admin/users",
      icon: Users,
      title: "用戶管理",
    },
    {
      href: "/admin/transactions",
      icon: FileText,
      title: "交易日誌",
    },
    {
      href: "/admin/database",
      icon: Database,
      title: "數據庫管理",
    },
    {
      href: "/admin/database/connection",
      icon: Server,
      title: "數據庫連接",
      parent: "/admin/database",
    },
    {
      href: "/admin/websites",
      icon: Globe,
      title: "網站管理",
    },
    {
      href: "/admin/telegram",
      icon: MessageSquare,
      title: "Telegram設置",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: "系統設置",
    },
  ]

  return (
    <div className="group flex flex-col gap-4 py-2">
      <nav className="grid gap-1 px-2">
        {routes.map((route, i) => {
          // 檢查是否為子路由
          const isChild = !!route.parent

          // 檢查當前路徑是否匹配
          const isActive = route.exact ? pathname === route.href : pathname.startsWith(route.href)

          // 檢查父路徑是否匹配（用於子路由）
          const isParentActive = isChild && pathname.startsWith(route.parent)

          return (
            <Link
              key={i}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "transparent hover:bg-accent hover:text-accent-foreground",
                isChild && "ml-4 text-xs",
              )}
            >
              <route.icon className={cn("h-4 w-4", isChild && "h-3 w-3")} />
              {route.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

