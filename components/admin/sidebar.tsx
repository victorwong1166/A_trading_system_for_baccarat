"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Database, Users, DollarSign, Settings, ExternalLink } from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="text-xl font-bold mb-8 p-2">百家樂系統管理</div>
      <nav className="space-y-2">
        <NavItem href="/" icon={<ExternalLink size={20} />} active={false}>
          返回前台
        </NavItem>
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

