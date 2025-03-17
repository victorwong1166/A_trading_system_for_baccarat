import type { Metadata } from "next"
import AdminHeader from "@/components/admin/admin-header"
import AdminDashboard from "@/components/admin/admin-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminUserManagement from "@/components/admin/admin-user-management"
import AdminSystemSettings from "@/components/admin/admin-system-settings"
import AdminTransactionLogs from "@/components/admin/admin-transaction-logs"

export const metadata: Metadata = {
  title: "交易系統 - 後台管理",
  description: "交易系統後台管理界面",
}

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">後台管理系統</h1>
          <p className="mt-2 text-gray-500">管理用戶、系統設置和查看交易日誌</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">儀表板</TabsTrigger>
            <TabsTrigger value="users">用戶管理</TabsTrigger>
            <TabsTrigger value="transactions">交易日誌</TabsTrigger>
            <TabsTrigger value="settings">系統設置</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>
          <TabsContent value="transactions">
            <AdminTransactionLogs />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSystemSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

