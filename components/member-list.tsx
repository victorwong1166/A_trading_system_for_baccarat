"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Member {
  id: string
  name: string
  balance: number
  createdAt: string
}

export function MemberList() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members")
        if (response.ok) {
          const data = await response.json()
          setMembers(data)
        } else {
          toast({
            title: "錯誤",
            description: "無法載入會員資料",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching members:", error)
        toast({
          title: "錯誤",
          description: "載入會員資料時發生錯誤",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [toast])

  if (loading) {
    return <div className="text-center py-4">載入中...</div>
  }

  if (members.length === 0) {
    return <div className="text-center py-4">尚無會員資料</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>會員編號</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead className="text-right">餘額</TableHead>
            <TableHead>建立日期</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.id}</TableCell>
              <TableCell>{member.name}</TableCell>
              <TableCell className="text-right">${member.balance.toFixed(2)}</TableCell>
              <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Link href={`/members/${member.id}`}>
                  <Button variant="outline" size="sm">
                    詳情
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

