import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 px-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4">頁面未找到</h2>
      <p className="text-muted-foreground mt-2 text-center">您訪問的頁面不存在或已被移除</p>
      <div className="mt-8">
        <Link href="/" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
          返回首頁
        </Link>
      </div>
    </div>
  )
}

