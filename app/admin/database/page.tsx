export default function DatabasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">數據庫連接</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">數據庫狀態</h3>
          <div className="mt-4">
            <p className="text-muted-foreground">數據庫連接功能正在開發中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

