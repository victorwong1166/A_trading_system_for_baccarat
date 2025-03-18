"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, UserPlus, Users, UserCheck } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getAllMembers, getMembersWithDebt } from "@/lib/member-service"

type Member = {
  id: number
  memberId: string
  name: string
  phone: string | null
  email: string | null
  type: "shareholder" | "agent" | "regular"
  createdAt: string
  totalDebt?: number
}

export default function MemberList() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDebt, setShowDebt] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [showDebt])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = showDebt ? await getMembersWithDebt() : await getAllMembers()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "錯誤",
        description: "無法獲取會員列表",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    // Implement search logic here
  }

  const handleDelete = async (id: number) => {
    // Implement delete logic here
  }

  const getMemberTypeLabel = (type: string) => {
    switch (type) {
      case "shareholder":
        return { label: "股東", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
      case "agent":
        return { label: "代理", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
      case "regular":
        return { label: "普通會員", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
      default:
        return { label: type, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
    }
  }

  const getMemberTypeIcon = (type: string) => {
    switch (type) {
      case "shareholder":
        return <Users className="h-4 w-4 mr-1" />
      case "agent":
        return <UserCheck className="h-4 w-4 mr-1" />
      case "regular":
        return <UserPlus className="h-4 w-4 mr-1" />
      default:
        return <UserPlus className="h-4 w-4 mr-1" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>會員管理</CardTitle>
        <CardDescription>管理系統中的所有會員</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 w-full max-w-sm">
            <Input
              placeholder="搜尋會員ID、姓名或電話"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full"
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showDebt"
                checked={showDebt}
                onCheckedChange={(checked) => setShowDebt(checked as boolean)}
              />
              <label
                htmlFor="showDebt"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                顯示結欠
              </label>
            </div>
            <Button onClick={() => router.push("/members/new")}>
              <Plus className="h-4 w-4 mr-2" /> 新增會員
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>會員ID</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>電話</TableHead>
                {showDebt && <TableHead className="text-right">結欠金額</TableHead>}
                <TableHead>創建日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    {showDebt && (
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    )}
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showDebt ? 7 : 6} className="text-center py-6 text-muted-foreground">
                    沒有找到會員記錄
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const typeInfo = getMemberTypeLabel(member.type)
                  const typeIcon = getMemberTypeIcon(member.type)

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.memberId}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`flex items-center ${typeInfo.color}`}>
                          {typeIcon}
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.phone || "-"}</TableCell>
                      {showDebt && (
                        <TableCell className="text-right">
                          {member.totalDebt !== undefined ? (
                            <span className={member.totalDebt > 0 ? "text-red-500 font-medium" : ""}>
                              {member.totalDebt.toLocaleString()}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                      <TableCell>{formatDate(member.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">打開菜單</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/members/${member.id}`)}>
                              <Eye className="h-4 w-4 mr-2" /> 查看詳情
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/members/${member.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" /> 編輯
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(member.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> 刪除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">總共 {members.length} 個會員</div>
      </CardFooter>
    </Card>
  )
}

