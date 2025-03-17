"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { UserPlus, Edit, RefreshCw } from "lucide-react"

interface User {
  id: string
  username: string
  name: string
  role: string
  lastLogin: string | null
  isActive: boolean
}

interface UserManagementProps {
  users: User[]
  onUserCreated: (user: User) => void
  onUserUpdated: (user: User) => void
}

// 表單驗證模式
const userFormSchema = z.object({
  username: z.string().min(3, "用戶名至少需要3個字符"),
  password: z.string().min(6, "密碼至少需要6個字符"),
  name: z.string().min(2, "姓名至少需要2個字符"),
  role: z.string().min(1, "請選擇角色"),
})

const userUpdateSchema = z.object({
  name: z.string().min(2, "姓名至少需要2個字符"),
  role: z.string().min(1, "請選擇角色"),
  isActive: z.boolean(),
  password: z.string().min(6, "密碼至少需要6個字符").optional(),
})

export function UserManagement({ users, onUserCreated, onUserUpdated }: UserManagementProps) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // 創建用戶表單
  const createForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "",
    },
  })

  // 更新用戶表單
  const updateForm = useForm<z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: "",
      role: "",
      isActive: true,
      password: "",
    },
  })

  // 創建用戶
  async function onCreateSubmit(values: z.infer<typeof userFormSchema>) {
    setIsCreating(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to create user")
      }

      const newUser = await response.json()
      toast({
        title: "用戶創建成功",
        description: `用戶 ${values.username} 已成功創建`,
      })
      onUserCreated(newUser)
      createForm.reset()
      setCreateDialogOpen(false)
    } catch (error) {
      toast({
        title: "創建用戶失敗",
        description: "請稍後再試或聯繫系統管理員",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // 更新用戶
  async function onUpdateSubmit(values: z.infer<typeof userUpdateSchema>) {
    if (!selectedUser) return

    setIsUpdating(true)
    try {
      // 如果密碼為空，則不更新密碼
      const updateData = { ...values }
      if (!updateData.password) {
        delete updateData.password
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      const updatedUser = await response.json()
      toast({
        title: "用戶更新成功",
        description: `用戶 ${selectedUser.username} 已成功更新`,
      })
      onUserUpdated(updatedUser)
      updateForm.reset()
      setEditDialogOpen(false)
    } catch (error) {
      toast({
        title: "更新用戶失敗",
        description: "請稍後再試或聯繫系統管理員",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // 打開編輯對話框
  function handleEditUser(user: User) {
    setSelectedUser(user)
    updateForm.reset({
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      password: "",
    })
    setEditDialogOpen(true)
  }

  // 角色中文名稱
  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "系統管理員",
      manager: "經理",
      operator: "操作員",
      viewer: "查看者",
    }
    return roleMap[role] || role
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>系統用戶管理</CardTitle>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              新增用戶
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增系統用戶</DialogTitle>
              <DialogDescription>創建新的系統用戶並分配權限角色</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用戶名</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入用戶名" {...field} />
                      </FormControl>
                      <FormDescription>用戶登入系統的唯一標識</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密碼</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="輸入密碼" {...field} />
                      </FormControl>
                      <FormDescription>至少6個字符</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇角色" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">系統管理員</SelectItem>
                          <SelectItem value="manager">經理</SelectItem>
                          <SelectItem value="operator">操作員</SelectItem>
                          <SelectItem value="viewer">查看者</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>決定用戶在系統中的權限</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    創建用戶
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用戶名</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>最後登入</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {getRoleName(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      啟用
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      停用
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "從未登入"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>編輯用戶</DialogTitle>
              <DialogDescription>{selectedUser && `更新 ${selectedUser.username} 的資料和權限`}</DialogDescription>
            </DialogHeader>
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇角色" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">系統管理員</SelectItem>
                          <SelectItem value="manager">經理</SelectItem>
                          <SelectItem value="operator">操作員</SelectItem>
                          <SelectItem value="viewer">查看者</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>啟用狀態</FormLabel>
                        <FormDescription>停用的用戶將無法登入系統</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>新密碼 (可選)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="留空表示不修改" {...field} />
                      </FormControl>
                      <FormDescription>如需修改密碼，請輸入新密碼</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    更新用戶
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

