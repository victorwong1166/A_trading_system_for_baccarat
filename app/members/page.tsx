import type { Metadata } from "next"
import MemberList from "@/components/members/member-list"

export const metadata: Metadata = {
  title: "會員管理",
  description: "管理系統中的所有會員",
}

export default function MembersPage() {
  return (
    <div className="container mx-auto py-6">
      <MemberList />
    </div>
  )
}

