"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Search, AlertCircle, Plus, Wallet, ArrowDownCircle, Coins } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { sendTransactionNotification } from "@/lib/telegram-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { transactionTypes, transactionCategories, getTransactionTypeName } from "@/lib/transaction-types"
import type { Project } from "./project-management"

// 模擬會員數據
const mockMembers = [
  { id: "M001", name: "張三", balance: -2000 },
  { id: "M002", name: "李四", balance: 0 },
  { id: "M003", name: "王五", balance: -5000 },
  { id: "M004", name: "趙六", balance: 1000 },
  { id: "M005", name: "張偉", balance: -3500 },
  { id: "M006", name: "王偉", balance: -800 },
  { id: "M007", name: "李明", balance: 500 },
  { id: "M008", name: "陳明", balance: -1200 },
  { id: "M009", name: "黃小明", balance: -7000 },
  { id: "M010", name: "劉德華", balance: 2000 },
]

// 預設項目
const defaultProjects: Project[] = [
  {
    id: "project-deposit-to-accounting",
    name: "存款轉至帳房",
    description: "將資金從存款轉移到帳房",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "transfer",
  },
  {
    id: "project-accounting-to-deposit",
    name: "帳房轉至存款",
    description: "將資金從帳房轉移到存款",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "transfer",
  },
  {
    id: "project-accounting-withdrawal",
    name: "帳房取款",
    description: "從帳房提取資金",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "expense",
  },
]

// 在 QuickTransaction 組件的參數中添加 initialData 參數
export default function QuickTransaction({ initialData = null }) {
  // 會員搜索和選擇
  const [memberName, setMemberName] = useState("")
  const [filteredMembers, setFilteredMembers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [amount, setAmount] = useState("")
  const [transactionType, setTransactionType] = useState("buy")
  const [itemDescription, setItemDescription] = useState("")
  const [activeCategory, setActiveCategory] = useState("basic")
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectType, setNewProjectType] = useState("expense")
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // 加載保存的項目
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProjects = localStorage.getItem("transaction-projects")
      let projectsToUse = savedProjects ? JSON.parse(savedProjects) : []

      // 檢查是否已經有預設項目
      const hasDefaultProjects = projectsToUse.some((p) => defaultProjects.some((dp) => dp.id === p.id))

      // 如果沒有預設項目，添加它們
      if (!hasDefaultProjects) {
        projectsToUse = [...projectsToUse, ...defaultProjects]
        localStorage.setItem("transaction-projects", JSON.stringify(projectsToUse))
      }

      setProjects(projectsToUse)
    }
  }, [])

  // 當交易類型改變時，重置相關字段
  useEffect(() => {
    // 如果切換到轉帳類型，自動清空會員並設置為選填
    if (transactionType === "transfer") {
      setMemberName("")
      setSelectedMember(null)
    }
  }, [transactionType])

  // 處理會員搜索
  useEffect(() => {
    if (memberName.trim() === "") {
      setFilteredMembers(mockMembers)
      setSelectedMember(null)
    } else {
      const filtered = mockMembers.filter((member) => member.name.includes(memberName))
      setFilteredMembers(filtered)

      // 如果只有一個完全匹配的會員，自動選擇該會員
      const exactMatch = mockMembers.find((member) => member.name === memberName)
      if (exactMatch) {
        setSelectedMember(exactMatch)
      } else {
        setSelectedMember(null)
      }
    }
  }, [memberName])

  // 點擊外部關閉下拉框
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 處理來自交易按鈕的初始數據
  useEffect(() => {
    if (initialData) {
      // 設置交易類型
      setTransactionType(initialData.type)

      // 設置金額（去掉負號）
      setAmount(Math.abs(initialData.amount).toString())

      // 如果有項目說明，設置它
      if (initialData.description) {
        setItemDescription(initialData.description)
      }

      // 如果有選定的項目，設置它
      if (initialData.project) {
        const project = projects.find((p) => p.name === initialData.project)
        if (project) {
          setSelectedProject(project)
        }
      }
    }
  }, [initialData, projects])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 驗證邏輯：
    // 1. 轉帳類型必須選擇項目
    // 2. 如果選擇了項目，會員變為選填
    // 3. 費用類交易需要項目說明
    const isTransfer = transactionType === "transfer"
    const needsMember =
      ["buy", "redeem", "sign", "return", "deposit", "withdrawal", "labor", "repayment", "clay", "codeFeed"].includes(
        transactionType,
      ) &&
      !selectedProject &&
      !isTransfer
    const needsDescription =
      ["rent", "system", "misc", "accounting", "capital"].includes(transactionType) && !selectedProject
    const needsProject = isTransfer

    if (needsProject && !selectedProject) {
      toast({
        title: "錯誤",
        description: "轉帳交易必須選擇項目",
        variant: "destructive",
      })
      return
    }

    if (needsMember && !selectedMember) {
      toast({
        title: "錯誤",
        description: "請選擇有效的會員",
        variant: "destructive",
      })
      return
    }

    if (needsDescription && !itemDescription.trim()) {
      toast({
        title: "錯誤",
        description: `${getTransactionTypeName(transactionType)}交易必須填寫項目說明`,
        variant: "destructive",
      })
      return
    }

    // 實際應用中，這裡會調用API進行交易
    const transactionData = {
      amount,
      transactionType: isTransfer ? "transfer" : transactionType,
      itemDescription,
      project: selectedProject ? selectedProject.name : null,
    }

    if (selectedMember) {
      transactionData.memberId = selectedMember.id
      transactionData.memberName = selectedMember.name
    }

    console.log("快速交易:", transactionData)

    // 顯示成功消息
    let successMessage = ""
    if (selectedProject) {
      successMessage = `已記錄項目 "${selectedProject.name}" 交易 $${amount}`
    } else if (needsDescription) {
      successMessage = `已記錄${getTransactionTypeName(transactionType)} $${amount} (${itemDescription})`
    } else if (transactionType === "sign" && selectedMember) {
      successMessage = `已為 ${selectedMember.name} 記錄簽碼盈利 $${amount}`
    } else if (transactionType === "return" && selectedMember) {
      successMessage = `已為 ${selectedMember.name} 記錄還碼虧損 $${amount}`
    } else if (selectedMember) {
      successMessage = `已為 ${selectedMember.name} ${getTransactionTypeName(transactionType)} $${amount}`
    } else {
      successMessage = `已記錄${getTransactionTypeName(transactionType)} $${amount}`
    }

    if (itemDescription && !["sign", "return"].includes(transactionType) && !needsDescription && !selectedProject) {
      successMessage += ` (${itemDescription})`
    }

    if (selectedMember && selectedProject) {
      successMessage += ` [會員: ${selectedMember.name}]`
    }

    toast({
      title: "交易成功",
      description: successMessage,
    })

    // 發送 Telegram 通知
    if (selectedMember) {
      // 假設用戶已綁定 Telegram，這裡使用模擬的 chatId
      const chatId = "123456789" // 實際應用中，這應該從用戶的綁定記錄中獲取
      sendTransactionNotification(chatId, transactionType, Number(amount), selectedMember.name)
    }

    // 重置表單
    setAmount("")
    setItemDescription("")
    setSelectedProject(null)
    // 如果是費用類交易，不保留會員信息
    if (!needsMember) {
      setMemberName("")
      setSelectedMember(null)
    }
  }

  const handleAmountButtonClick = (value: number) => {
    // 如果已有金額，則添加到現有金額
    const currentAmount = amount ? Number.parseInt(amount) : 0
    setAmount((currentAmount + value).toString())
  }

  const handleMemberSelect = (member) => {
    setMemberName(member.name)
    setSelectedMember(member)
    setShowDropdown(false)
  }

  // 保存新項目
  const handleSaveProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "錯誤",
        description: "項目名稱不能為空",
        variant: "destructive",
      })
      return
    }

    const now = new Date().toISOString()
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectName.trim(),
      description: "",
      createdAt: now,
      updatedAt: now,
      type: newProjectType,
    }

    const updatedProjects = [...projects, newProject]
    localStorage.setItem("transaction-projects", JSON.stringify(updatedProjects))
    setProjects(updatedProjects)
    setSelectedProject(newProject)
    setNewProjectName("")
    setIsProjectDialogOpen(false)

    toast({
      title: "項目已添加",
      description: `項目 "${newProject.name}" 已成功添加並選擇`,
    })
  }

  // 檢查當前交易類型是否需要會員
  const isTransfer = transactionType === "transfer"
  const needsMember =
    ["buy", "redeem", "sign", "return", "deposit", "withdrawal", "labor", "repayment", "clay", "codeFeed"].includes(
      transactionType,
    ) &&
    !selectedProject &&
    !isTransfer
  const needsDescription =
    ["rent", "system", "misc", "accounting", "capital"].includes(transactionType) && !selectedProject

  // 按類別過濾交易類型，只顯示基本交易類別
  const filteredTransactionTypes = transactionTypes.filter((type) => type.category === activeCategory)

  // 只顯示基本交易類別
  const visibleCategories = transactionCategories.filter((cat) => cat.id === "basic")

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">交易類型</h3>
          {/* 已隱藏交易類型標籤 */}
          <input type="hidden" value="basic" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="memberName" className={!needsMember && !isTransfer ? "text-gray-400" : ""}>
              會員名稱{" "}
              {!needsMember
                ? `(${selectedProject ? "已選擇項目" : getTransactionTypeName(transactionType)}，會員為選填)`
                : ""}
            </Label>
            <div className="relative">
              <Input
                id="memberName"
                ref={inputRef}
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder={!needsMember ? `選填會員名稱` : "輸入會員名稱"}
                required={needsMember}
                className={`pr-10 ${!needsMember && !isTransfer ? "bg-gray-100" : ""}`}
                disabled={!needsMember && !isTransfer && !selectedProject}
              />
              <Search
                className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${!needsMember && !isTransfer ? "text-gray-400" : "text-gray-500"}`}
              />

              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg"
                >
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleMemberSelect(member)}
                      >
                        <div className="flex justify-between">
                          <span>
                            {member.name} ({member.id})
                          </span>
                          <span
                            className={member.balance < 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}
                          >
                            ${member.balance}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">無匹配會員</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>交易類型</Label>
            <div
              className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
              onClick={(e) => {
                // If the click is directly on the grid container (not on buttons)
                if (e.target === e.currentTarget) {
                  setTransactionType("") // Reset transaction type
                }
              }}
            >
              {filteredTransactionTypes
                .filter((type) => !["rent", "system"].includes(type.id)) // 過濾掉場租和系統按鈕
                .map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.id}
                      type="button"
                      size="sm"
                      variant={transactionType === type.id ? "default" : "outline"}
                      className={`${transactionType === type.id ? "bg-primary text-primary-foreground" : ""} text-xs`}
                      onClick={() => setTransactionType(type.id)}
                    >
                      <Icon className={`mr-1 h-2 w-4 ${type.color || ""}`} />
                      {type.name}
                    </Button>
                  )
                })}
              {/* 添加利是按鈕 */}
              <Button
                type="button"
                size="sm"
                variant={transactionType === "redpacket" ? "default" : "outline"}
                className={`${transactionType === "redpacket" ? "bg-primary text-primary-foreground" : ""} text-xs`}
                onClick={() => setTransactionType("redpacket")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-2 w-4 text-red-500"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                利是
              </Button>
              {/* 添加還款按鈕 */}
              <Button
                type="button"
                size="sm"
                variant={transactionType === "repayment" ? "default" : "outline"}
                className={`${transactionType === "repayment" ? "bg-primary text-primary-foreground" : ""} text-xs`}
                onClick={() => setTransactionType("repayment")}
              >
                <ArrowDownCircle className="mr-1 h-2 w-4 text-green-500" />
                還款
              </Button>
              {/* 添加存款按鈕 */}
              <Button
                type="button"
                size="sm"
                variant={transactionType === "deposit" ? "default" : "outline"}
                className={`${transactionType === "deposit" ? "bg-primary text-primary-foreground" : ""} text-xs`}
                onClick={() => setTransactionType("deposit")}
              >
                <Wallet className="mr-1 h-2 w-4 text-blue-500" />
                存款
              </Button>
              {/* 添加泥碼按鈕 */}
              <Button
                type="button"
                size="sm"
                variant={transactionType === "clay" ? "default" : "outline"}
                className={`${transactionType === "clay" ? "bg-primary text-primary-foreground" : ""} text-xs`}
                onClick={() => setTransactionType("clay")}
              >
                <Coins className="mr-1 h-2 w-4 text-amber-500" />
                泥碼
              </Button>
              {/* 添加碼糧按鈕 */}
              <Button
                type="button"
                size="sm"
                variant={transactionType === "codeFeed" ? "default" : "outline"}
                className={`${transactionType === "codeFeed" ? "bg-primary text-primary-foreground" : ""} text-xs`}
                onClick={() => setTransactionType("codeFeed")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-2 w-4 text-purple-500"
                >
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.4 3.4 10 8 10s8-4.6 8-10a8 8 0 0 0-8-8zm0 14c-3.7 0-6-3-6-6a6 6 0 0 1 12 0c0 3-2.3 6-6 6z" />
                  <path d="M12 6v4l3 3" />
                </svg>
                碼糧
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="project">項目 {isTransfer ? "(必選)" : "(選填)"}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsProjectDialogOpen(true)}
                className="h-8 px-2 text-xs"
              >
                <Plus className="mr-1 h-2 w-4" />
                新增項目
              </Button>
            </div>
            <Select
              value={selectedProject?.id || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectedProject(null)
                } else {
                  const project = projects.find((p) => p.id === value)
                  setSelectedProject(project || null)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={isTransfer ? "選擇轉帳項目（必選）" : "選擇項目（可選）"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">無項目</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
              <p className="text-xs text-gray-500 mt-1">
                新增的項目將顯示在後台管理的項目列表中，管理員可以修改或移除項目。
              </p>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">金額 (HKD)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="輸入金額"
              required
              min="1"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => handleAmountButtonClick(10)}>
                十
              </Button>
              <Button type="button" variant="outline" onClick={() => handleAmountButtonClick(100)}>
                百
              </Button>
              <Button type="button" variant="outline" onClick={() => handleAmountButtonClick(1000)}>
                千
              </Button>
              <Button type="button" variant="outline" onClick={() => handleAmountButtonClick(10000)}>
                萬
              </Button>
            </div>
          </div>

          {!selectedProject && (
            <div className="grid gap-2">
              <Label htmlFor="itemDescription">項目說明 {needsDescription ? "(必填)" : "(選填)"}</Label>
              <Textarea
                id="itemDescription"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder={
                  needsDescription ? `請輸入${getTransactionTypeName(transactionType)}說明（必填）` : "輸入交易說明"
                }
                className="resize-none"
                rows={2}
                required={needsDescription}
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            確認交易
          </Button>
        </form>
      </CardContent>

      {selectedMember && needsMember && (
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="font-medium mb-2 sm:mb-0">
                會員: {selectedMember.name} ({selectedMember.id})
              </div>
              <div
                className={`font-bold text-lg ${
                  selectedMember.balance < 0 ? "text-red-500" : selectedMember.balance > 0 ? "text-green-500" : ""
                }`}
              >
                當前結欠: ${selectedMember.balance}
              </div>
            </div>

            {selectedMember.balance < -5000 && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>警告: 該會員結欠金額較大，請注意風險控制</AlertDescription>
              </Alert>
            )}
          </div>
        </CardFooter>
      )}

      {/* 新增項目對話框 */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增項目</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-project-name">項目名稱</Label>
              <Input
                id="new-project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="輸入新項目名稱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-project-type">項目類型</Label>
              <Select value={newProjectType} onValueChange={(value) => setNewProjectType(value)}>
                <SelectTrigger id="new-project-type">
                  <SelectValue placeholder="選擇項目類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">費用支出</SelectItem>
                  <SelectItem value="transfer">資金轉帳</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveProject}>保存項目</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

