"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 px-4">
      <h1 className="text-4xl font-bold text-destructive">出錯了</h1>
      <h2 className="text-xl font-semibold mt-4">系統發生錯誤</h2>
      <p className="text-muted-foreground mt-2 text-center max-w-md">
        {error.message || "應用程序遇到了意外錯誤，請稍後再試"}
      </p>
      {error.digest && <p className="text-xs text-muted-foreground mt-2">錯誤 ID: {error.digest}</p>}
      <div className="mt-8 space-x-4">
        <Button onClick={reset} variant="default">
          重試
        </Button>
        <Button asChild variant="outline">
          <Link href="/">返回首頁</Link>
        </Button>
      </div>
    </div>
  )
}

