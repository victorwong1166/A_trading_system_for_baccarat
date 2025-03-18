"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AddMemberPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      })

      if (response.ok) {
        toast({
          title: "新增會員成功",
          description: "會員資料已成功儲存",
        })
        router.push("/members")
      } else {
        // Handle non-OK responses
        let errorMessage = "請檢查您的輸入或稍後再試"
        try {
          // Try to parse as JSON, but handle text responses too
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            // Handle text responses
            errorMessage = await response.text()
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError)
        }

        toast({
          title: "新增會員失敗",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "新增會員失敗",
        description: "網絡錯誤或服務器無響應",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新增會員</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            姓名:
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          新增
        </button>
      </form>
    </div>
  )
}

