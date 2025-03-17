import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MemberForm from "@/components/members/member-form"
import { getMemberById } from "@/lib/member-service"

export const metadata: Metadata = {
  title: "編輯會員",
  description: "更新會員資料",
}

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    notFound()
  }

  try {
    const member = await getMemberById(id)

    if (!member) {
      notFound()
    }

    return (
      <div className="container mx-auto py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">編輯會員</h2>
        <MemberForm
          memberId={id}
          defaultValues={{
            name: member.name,
            phone: member.phone || "",
            email: member.email || "",
            address: member.address || "",
            type: member.type,
            agentId: member.agentId,
            notes: member.notes || "",
          }}
          isEditing={true}
        />
      </div>
    )
  } catch (error) {
    console.error("Error fetching member for edit:", error)
    notFound()
  }
}

