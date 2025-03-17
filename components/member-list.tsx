import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"

// Update the mock members data to include category and agent information
const members = [
  {
    id: "M001",
    name: "張三",
    phone: "1234-5678",
    balance: -2000,
    joinDate: "2023-01-15",
    status: "活躍",
    category: "shareholder",
  },
  {
    id: "M002",
    name: "李四",
    phone: "2345-6789",
    balance: 0,
    joinDate: "2023-02-20",
    status: "活躍",
    category: "agent",
  },
  {
    id: "M003",
    name: "王五",
    phone: "3456-7890",
    balance: -5000,
    joinDate: "2023-03-10",
    status: "活躍",
    category: "regular",
    agentId: "M002",
    agentName: "李四",
  },
  {
    id: "M004",
    name: "趙六",
    phone: "4567-8901",
    balance: 1000,
    joinDate: "2023-04-05",
    status: "非活躍",
    category: "regular",
    agentId: "M002",
    agentName: "李四",
  },
]

export default function MemberList() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">姓名</th>
                <th className="px-4 py-3">類別</th>
                <th className="px-4 py-3">電話</th>
                <th className="px-4 py-3">結餘</th>
                <th className="px-4 py-3">加入日期</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b text-sm">
                  <td className="px-4 py-3">{member.id}</td>
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        member.category === "shareholder"
                          ? "default"
                          : member.category === "agent"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {member.category === "shareholder" && "股東"}
                      {member.category === "agent" && "代理"}
                      {member.category === "regular" && "普通會員"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{member.phone}</td>
                  <td className="px-4 py-3" style={{ color: member.balance < 0 ? "red" : "inherit" }}>
                    ${member.balance}
                  </td>
                  <td className="px-4 py-3">{member.joinDate}</td>
                  <td className="px-4 py-3">
                    <Badge variant={member.status === "活躍" ? "default" : "secondary"}>{member.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link href={`/members/${member.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">查看</span>
                        </Button>
                      </Link>
                      <Link href={`/members/${member.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">編輯</span>
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

