export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">總會員數</h3>
          </div>
          <div className="text-2xl font-bold">128</div>
          <p className="text-xs text-muted-foreground">+10% 較上月</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">總交易額</h3>
          </div>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">+20.1% 較上月</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">活躍會員</h3>
          </div>
          <div className="text-2xl font-bold">42</div>
          <p className="text-xs text-muted-foreground">+12% 較上月</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">總結欠</h3>
          </div>
          <div className="text-2xl font-bold">$12,234.00</div>
          <p className="text-xs text-muted-foreground">-2% 較上月</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium">最近交易</h3>
            <div className="mt-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">交易 #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(Math.random() * 1000).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{Math.random() > 0.5 ? "存款" : "提款"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium">系統通知</h3>
            <div className="mt-4 space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm font-medium">系統更新</p>
                <p className="text-xs text-muted-foreground">系統將於今晚進行例行維護</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <p className="text-sm font-medium">會員提醒</p>
                <p className="text-xs text-muted-foreground">有 3 位會員結欠超過 30 天</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-sm font-medium">交易提醒</p>
                <p className="text-xs text-muted-foreground">今日交易額已超過昨日總額</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

