import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MemberList } from "@/components/member-list"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function MembersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">會員管理</h1>
        <Link href="/members/add">
          <Button>新增會員</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>會員列表</CardTitle>
          <CardDescription>管理所有會員資料</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-4">載入中...</div>}>
            <MemberList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

