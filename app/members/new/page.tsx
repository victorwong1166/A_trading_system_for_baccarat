import type { Metadata } from "next"
import MemberForm from "@/components/members/member-form"

export const metadata: Metadata = {
  title: "新增會員",
  description: "創建新會員",
}

export default function NewMemberPage() {
  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold tracking-tight mb-6">新增會員</h2>
      <MemberForm />
    </div>
  )
}

