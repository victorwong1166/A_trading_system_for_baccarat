import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 px-4">
      <h1 className="text-4xl font-bold text-center">會員管理系統</h1>
      <p className="mt-4 text-xl text-center text-muted-foreground max-w-md">
        完整的會員管理、交易記錄和結欠跟踪解決方案
      </p>
      <div className="mt-8 space-x-4">
        <Button asChild>
          <Link href="/admin">進入後台</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">登入系統</Link>
        </Button>
      </div>
    </div>
  )
}

