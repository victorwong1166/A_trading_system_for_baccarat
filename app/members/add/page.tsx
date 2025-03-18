"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function AddMemberPage() {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "錯誤",
        description: "請輸入會員姓名",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      // 檢查響應狀態
      if (response.ok) {
        toast({
          title: "成功",
          description: "新增會員成功",
          variant: "success",
        })

        // 重置表單
        setName("")

        // 導航到會員列表頁面
        router.push("/members")
      } else {
        // 處理錯誤響應
        const contentType = response.headers.get("content-type")
        let errorMessage = "新增會員失敗"

        if (contentType && contentType.includes("application/json")) {
          // 如果是 JSON 響應
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } else {
          // 如果是文本響應
          errorMessage = await response.text()
        }

        toast({
          title: "錯誤",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "錯誤",
        description: "提交表單時發生錯誤，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h1 className="text-xl font-bold mb-2">新增會員</h1>
          <p className="text-gray-600 mb-4">請填寫新會員的資料</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                會員姓名
              </label>
              <input
                id="name"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入會員姓名"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => router.back()}
              >
                取消
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isSubmitting}
              >
                {isSubmitting ? "處理中..." : "新增會員"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

