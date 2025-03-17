"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function MemberForm({ member = null }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: member?.name || "",
    phone: member?.phone || "",
    email: member?.email || "",
    address: member?.address || "",
    notes: member?.notes || "",
    category: member?.category || "regular", // 新增: 會員類別
    agentId: member?.agentId || "", // 新增: 代理ID
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add a state for available agents
  const [availableAgents, setAvailableAgents] = useState([
    { id: "A001", name: "王經理" },
    { id: "A002", name: "李經理" },
    { id: "A003", name: "張經理" },
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "錯誤",
        description: "會員名稱為必填項",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 模擬API請求
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 實際應用中，這裡會調用API保存數據
      console.log("保存會員數據:", formData)

      toast({
        title: "成功",
        description: `會員 ${formData.name} 已成功創建`,
      })

      // 模擬保存成功後跳轉
      router.push("/members")
    } catch (error) {
      toast({
        title: "錯誤",
        description: "創建會員時發生錯誤，請重試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>會員資料</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              <p className="text-xs text-muted-foreground">會員姓名為必填項，其他資料可選填</p>
            </div>

            <div className="grid gap-2">
              <Label>會員類別</Label>
              <RadioGroup
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shareholder" id="shareholder" />
                  <Label htmlFor="shareholder" className="cursor-pointer">
                    股東
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="agent" id="agent" />
                  <Label htmlFor="agent" className="cursor-pointer">
                    代理
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="cursor-pointer">
                    普通會員
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.category === "regular" && (
              <div className="grid gap-2">
                <Label htmlFor="agentId">選擇代理 (上線)</Label>
                <Select value={formData.agentId} onValueChange={(value) => handleSelectChange("agentId", value)}>
                  <SelectTrigger id="agentId">
                    <SelectValue placeholder="選擇代理" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">無代理</SelectItem>
                    {availableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="phone">電話</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">地址</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">備註</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/members")} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "處理中..." : member ? "更新" : "創建會員"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

