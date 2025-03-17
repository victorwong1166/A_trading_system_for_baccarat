"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CreditCard, Settings, FileText, Shield, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

interface AdminNavProps {
  className?: string
}

export function AdminNav({ className }: AdminNavProps) {
  const pathname = usePathname()

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
      icon: BarChart3,
    },
    {
      title: "系統設置",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "用戶管理",
      href: "/admin/users",
      icon: Shield,
    },
    {
      title: "系統日誌",
      href: "/admin/logs",
      icon: FileText,
    },
  ]

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <item.icon className="h-5 w-5 mr-3" />
          {item.title}
        </Link>
      ))}
      <div className="pt-4 mt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 mr-3" />
          登出系統
        </Button>
      </div>
    </nav>
  )
}

