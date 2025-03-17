"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

// 表單驗證模式
const memberFormSchema = z.object({
  memberId: z.string().optional(),
  name: z.string().min(1, { message: "會員姓名不能為空" }),
  phone: z.string().optional(),
  email: z.string().email({ message: "請輸入有效的電子郵件地址" }).optional().or(z.literal("")),
  address: z.string().optional(),
  type: z.enum(["shareholder", "agent", "regular"], {
    required_error: "請選擇會員類型",
  }),
  agentId: z.number().optional().nullable(),
  notes: z.string().optional(),
})

type MemberFormValues = z.infer<typeof memberFormSchema>

type Agent = {
  id: number
  name: string
  memberId: string
}

interface MemberFormProps {
  memberId?: number
  defaultValues?: Partial<MemberFormValues>
  isEditing?: boolean
}

export default function MemberForm({ memberId, defaultValues, isEditing = false }: MemberFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: defaultValues || {
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "regular",
      agentId: null,
      notes: "",
    },
  })

  // 獲取所有代理會員
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoadingAgents(true)
        const response = await fetch("/api/members?type=agent")

        if (!response.ok) {
          throw new Error("Failed to fetch agents")
        }

        const data = await response.json()
        setAgents(data)
      } catch (error) {
        console.error("Error fetching agents:", error)
        toast({
          title: "錯誤",
          description: "無法獲取代理會員列表",
          variant: "destructive",
        })
      } finally {
        setIsLoadingAgents(false)
      }
    }

    fetchAgents()
  }, [])

  async function onSubmit(data: MemberFormValues) {
    try {
      setIsSubmitting(true)

      const url = isEditing ? `/api/members/${memberId}` : "/api/members"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "操作失敗")
      }

      toast({
        title: "成功",
        description: isEditing ? "會員資料已更新" : "會員已成功創建",
      })

      // 返回會員列表頁面
      router.push("/members")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "錯誤",
        description: error instanceof Error ? error.message : "提交表單時出錯",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "編輯會員" : "新增會員"}</CardTitle>
        <CardDescription>{isEditing ? "更新會員資料" : "創建新會員並分配會員ID"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isEditing && (
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>會員ID</FormLabel>
                      <FormControl>
                        <Input placeholder="留空將自動生成" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>可選。如不填寫將自動生成唯一ID</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入會員姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入會員電話" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電子郵件</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入會員電子郵件" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>會員類型 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇會員類型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="regular">普通會員</SelectItem>
                        <SelectItem value="agent">代理</SelectItem>
                        <SelectItem value="shareholder">股東</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上級代理</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number.parseInt(value) : null)}
                      defaultValue={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇上級代理" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">無上級代理</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name} ({agent.memberId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>可選。選擇此會員的上級代理</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>地址</FormLabel>
                  <FormControl>
                    <Input placeholder="輸入會員地址" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備註</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="輸入會員相關備註"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "更新會員" : "創建會員"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

