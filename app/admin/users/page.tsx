"use client"

import { useEffect, useState } from "react"
import { UserManagement } from "@/components/admin/user-management"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

interface User {
  id: string
  username: string
  name: string
  role: string
  lastLogin: string | null
  isActive: boolean
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  // 獲取系統用戶
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast({
        title: "獲取用戶失敗",
        description: "無法載入系統用戶，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 處理用戶創建
  const handleUserCreated = (newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser])
  }

  // 處理用戶更新
  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prevUsers) => prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">用戶管理</h1>
      </div>

      <UserManagement users={users} onUserCreated={handleUserCreated} onUserUpdated={handleUserUpdated} />
    </div>
  )
}

