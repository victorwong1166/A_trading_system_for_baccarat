"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Database, Users, DollarSign, Settings, LogOut } from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("登出錯誤:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="text-xl font-bold mb-8 p-2">百家樂系統管理</div>
      <nav className="space-y-2">
        <NavItem href="/admin" icon={<Home size={20} />} active={isActive("/admin") && pathname === "/admin"}>
          儀表板
        </NavItem>
        <NavItem href="/admin/database" icon={<Database size={20} />} active={isActive("/admin/database")}>
          數據庫管理
        </NavItem>
        <NavItem href="/admin/members" icon={<Users size={20} />} active={isActive("/admin/members")}>
          會員管理
        </NavItem>
        <NavItem href="/admin/cash" icon={<DollarSign size={20} />} active={isActive("/admin/cash")}>
          現金管理
        </NavItem>
        <NavItem href="/admin/settings" icon={<Settings size={20} />} active={isActive("/admin/settings")}>
          系統設置
        </NavItem>
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="outline" className="w-full text-white border-white hover:bg-gray-800" onClick={handleLogout}>
          <LogOut size={18} className="mr-2" />
          登出
        </Button>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  active,
  children,
}: {
  href: string
  icon: React.ReactNode
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex items-center p-2 rounded-md transition-colors ${
        active ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  )
}

