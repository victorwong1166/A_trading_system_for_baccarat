"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testDatabaseConnection, addTestRecord, checkTableStructure } from "./actions"

export default function TestDbPage() {
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [addResult, setAddResult] = useState<any>(null)
  const [tableStructure, setTableStructure] = useState<any>(null)

  const handleTestConnection = async () => {
    const result = await testDatabaseConnection()
    setConnectionResult(result)
  }

  const handleAddRecord = async () => {
    const result = await addTestRecord()
    setAddResult(result)
  }

  const handleCheckStructure = async () => {
    const result = await checkTableStructure()
    setTableStructure(result)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">數據庫測試頁面</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>測試數據庫連接</CardTitle>
            <CardDescription>檢查應用程序是否可以連接到數據庫</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTestConnection}>測試數據庫連接</Button>

            {connectionResult && (
              <div className="mt-4 p-4 rounded border">
                <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(connectionResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>檢查表結構</CardTitle>
            <CardDescription>檢查 transactions 表的列結構</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCheckStructure}>檢查表結構</Button>

            {tableStructure && (
              <div className="mt-4 p-4 rounded border">
                <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(tableStructure, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>添加測試記錄</CardTitle>
          <CardDescription>嘗試向 transactions 表添加一條測試記錄</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAddRecord}>添加測試記錄</Button>

          {addResult && (
            <div className="mt-4 p-4 rounded border">
              <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(addResult, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

