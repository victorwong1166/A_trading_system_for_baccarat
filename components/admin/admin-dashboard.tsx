import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, CreditCard, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-gray-500">較上月 +12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">交易總額</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,245,600</div>
            <p className="text-xs text-gray-500">較上月 +8%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">系統盈利</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$158,000</div>
            <p className="text-xs text-gray-500">較上月 +15%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">異常交易</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">5</div>
            <p className="text-xs text-gray-500">較上月 -2</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>系統活動</CardTitle>
            <CardDescription>最近24小時系統活動記錄</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-green-100 p-2">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">系統備份完成</p>
                  <p className="text-xs text-gray-500">今天 03:00</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-blue-100 p-2">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">新增用戶 (ID: M128)</p>
                  <p className="text-xs text-gray-500">今天 10:23</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-amber-100 p-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">檢測到異常登入嘗試</p>
                  <p className="text-xs text-gray-500">今天 14:45</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-purple-100 p-2">
                  <TrendingDown className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">完成分紅結算</p>
                  <p className="text-xs text-gray-500">今天 18:30</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="mt-4 w-full">
              查看所有活動
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系統狀態</CardTitle>
            <CardDescription>當前系統運行狀態</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium">數據庫連接</p>
                </div>
                <p className="text-sm text-green-600">正常</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium">API 服務</p>
                </div>
                <p className="text-sm text-green-600">正常</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium">支付系統</p>
                </div>
                <p className="text-sm text-green-600">正常</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-amber-500"></div>
                  <p className="text-sm font-medium">備份系統</p>
                </div>
                <p className="text-sm text-amber-600">需要注意</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium">系統負載</p>
                </div>
                <p className="text-sm text-green-600">32%</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-medium">系統版本</h4>
              <div className="rounded-md bg-gray-100 p-2">
                <p className="text-xs font-mono">交易系統 v1.2.5 (最後更新: 2023-05-20)</p>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button variant="outline" className="flex-1">
                系統診斷
              </Button>
              <Button className="flex-1">更新系統</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

