"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionList } from "@/components/transactions/transaction-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TransactionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">交易管理</h1>
        <Button onClick={() => router.push("/admin/transactions/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新增交易
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">全部交易</TabsTrigger>
          <TabsTrigger value="chips">碼量交易</TabsTrigger>
          <TabsTrigger value="money">資金交易</TabsTrigger>
          <TabsTrigger value="expense">費用交易</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <TransactionList category={activeTab === "all" ? undefined : activeTab} />
        </TabsContent>
        <TabsContent value="chips">
          <TransactionList category="chips" />
        </TabsContent>
        <TabsContent value="money">
          <TransactionList category="money" />
        </TabsContent>
        <TabsContent value="expense">
          <TransactionList category="expense" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

