"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin"
  const error = searchParams?.get("error")

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError("用戶名或密碼錯誤")
        setIsLoading(false)
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("登入過程中發生錯誤，請稍後再試")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">後台管理系統</CardTitle>
          <CardDescription>請輸入您的用戶名和密碼登入系統</CardDescription>
        </CardHeader>
        <CardContent>
          {(error || loginError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error === "unauthorized"
                  ? "您沒有權限訪問管理頁面"
                  : error === "session"
                    ? "會話已過期，請重新登入"
                    : loginError || "登入失敗，請檢查您的憑據"}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用戶名</Label>
                <Input
                  id="username"
                  placeholder="請輸入用戶名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登入中...
                  </>
                ) : (
                  "登入"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            測試帳號：用戶名 <span className="font-mono">admin</span>，密碼 <span className="font-mono">admin</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

