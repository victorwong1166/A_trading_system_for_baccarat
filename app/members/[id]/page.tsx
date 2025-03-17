import type { Metadata } from "next"
import MemberDetail from "@/components/members/member-detail"

export const metadata: Metadata = {
  title: "會員詳情",
  description: "查看會員詳細資料和交易記錄",
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const { id } = params

  return (
    <div className="flex min-h-screen flex-col">
      {/* <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <Link href="/members">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回會員列表
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">會員詳情</h1>
            <div className="flex space-x-2">
              <Link href={`/transactions/buy-chips?memberId=${id}`}>
                <Button variant="outline" size="sm">
                  <DollarSign className="mr-2 h-4 w-4" />
                  買碼
                </Button>
              </Link>
              <Link href={`/transactions/redeem-chips?memberId=${id}`}>
                <Button variant="outline" size="sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  兌碼
                </Button>
              </Link>
              <Link href={`/transactions/sign?memberId=${id}`}>
                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  簽碼
                </Button>
              </Link>
              <Link href={`/transactions/return?memberId=${id}`}>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <TrendingDown className="mr-2 h-4 w-4" />
                  還碼
                </Button>
              </Link>
              <Link href={`/members/${id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  編輯
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <MemberDetails id={id} />
          </div>
          <div className="md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">交易記錄</h2>
            <MemberTransactions id={id} />
          </div>
        </div>
      </main> */}
      <div className="container mx-auto py-6">
        <MemberDetail memberId={params.id} />
      </div>
    </div>
  )
}

