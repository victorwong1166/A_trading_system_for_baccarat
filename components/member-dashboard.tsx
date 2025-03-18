"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MemberTable from "@/components/member-table"
import MemberForm from "@/components/member-form"

// 示例会员数据
const initialMembers = [
  {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    status: "active",
    joinDate: "2023-01-15",
    membershipType: "高级",
  },
  { id: 2, name: "李四", email: "lisi@example.com", status: "active", joinDate: "2023-02-20", membershipType: "标准" },
  {
    id: 3,
    name: "王五",
    email: "wangwu@example.com",
    status: "inactive",
    joinDate: "2022-11-05",
    membershipType: "高级",
  },
  {
    id: 4,
    name: "赵六",
    email: "zhaoliu@example.com",
    status: "active",
    joinDate: "2023-03-10",
    membershipType: "标准",
  },
  {
    id: 5,
    name: "钱七",
    email: "qianqi@example.com",
    status: "pending",
    joinDate: "2023-04-25",
    membershipType: "基础",
  },
]

export default function MemberDashboard() {
  const [members, setMembers] = useState(initialMembers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddMember = (newMember) => {
    const id = members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1
    setMembers([...members, { ...newMember, id }])
    setShowForm(false)
  }

  const handleEditMember = (member) => {
    setCurrentMember(member)
    setShowForm(true)
  }

  const handleUpdateMember = (updatedMember) => {
    setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)))
    setShowForm(false)
    setCurrentMember(null)
  }

  const handleDeleteMember = (id) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <Input
            placeholder="搜索会员..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button
          onClick={() => {
            setCurrentMember(null)
            setShowForm(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> 添加会员
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">所有会员</TabsTrigger>
          <TabsTrigger value="active">活跃会员</TabsTrigger>
          <TabsTrigger value="inactive">非活跃会员</TabsTrigger>
          <TabsTrigger value="pending">待审核会员</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>所有会员</CardTitle>
              <CardDescription>管理您组织的所有会员。</CardDescription>
            </CardHeader>
            <CardContent>
              <MemberTable members={filteredMembers} onEdit={handleEditMember} onDelete={handleDeleteMember} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>活跃会员</CardTitle>
              <CardDescription>查看和管理活跃会员。</CardDescription>
            </CardHeader>
            <CardContent>
              <MemberTable
                members={filteredMembers.filter((m) => m.status === "active")}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>非活跃会员</CardTitle>
              <CardDescription>查看和管理非活跃会员。</CardDescription>
            </CardHeader>
            <CardContent>
              <MemberTable
                members={filteredMembers.filter((m) => m.status === "inactive")}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>待审核会员</CardTitle>
              <CardDescription>查看和管理待审核会员。</CardDescription>
            </CardHeader>
            <CardContent>
              <MemberTable
                members={filteredMembers.filter((m) => m.status === "pending")}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && (
        <MemberForm
          member={currentMember}
          onSubmit={currentMember ? handleUpdateMember : handleAddMember}
          onCancel={() => {
            setShowForm(false)
            setCurrentMember(null)
          }}
        />
      )}
    </div>
  )
}

