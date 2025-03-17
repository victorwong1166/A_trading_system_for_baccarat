import type { Metadata } from "next"
import DatabaseConnectionTest from "@/components/admin/database-connection-test"

export const metadata: Metadata = {
  title: "數據庫連接 | 管理後台",
  description: "測試和管理數據庫連接",
}

export default function DatabaseConnectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">數據庫連接</h1>
          <p className="text-muted-foreground">測試數據庫連接並查看連接狀態</p>
        </div>
      </div>
      <DatabaseConnectionTest />
    </div>
  )
}

