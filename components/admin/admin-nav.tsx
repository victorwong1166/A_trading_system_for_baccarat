"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Settings, FileText, Database } from "lucide-react"

const items = [
  {
    title: "儀表板",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "用戶管理",
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
    <nav className="grid items-start gap-2">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  )
}

