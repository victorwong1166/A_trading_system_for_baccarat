"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { testDatabaseConnection, addTestRecord } from "./actions"

export default function TestDbPage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleTestConnection = async () => {
    setLoading(true)
    try {
      const response = await testDatabaseConnection()
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecord = async () => {
    setLoading(true)
    try {
      const response = await addTestRecord()
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">數據庫測試頁面</h1>

      <div className="flex gap-4 mb-4">
        <Button onClick={handleTestConnection} disabled={loading}>
          測試數據庫連接
        </Button>

        <Button onClick={handleAddRecord} disabled={loading}>
          添加測試記錄
        </Button>
      </div>

      {loading && <p>加載中...</p>}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}

