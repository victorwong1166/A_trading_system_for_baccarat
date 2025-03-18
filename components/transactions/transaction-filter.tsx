"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { transactionTypes, transactionCategories } from "@/lib/transaction-types"

interface TransactionFilterProps {
  onFilter: (filters: any) => void
  initialCategory?: string
}

export function TransactionFilter({ onFilter, initialCategory }: TransactionFilterProps) {
  const [filters, setFilters] = useState({
    memberId: "",
    memberName: "",
    type: "",
    category: initialCategory || "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    minAmount: "",
    maxAmount: "",
  })

  useEffect(() => {
    if (initialCategory) {
      setFilters((prev) => ({ ...prev, category: initialCategory }))
    }
  }, [initialCategory])

  const handleChange = (field: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [field]: value }
      return newFilters
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilter(filters)
  }

  const handleReset = () => {
    const resetFilters = {
      memberId: "",
      memberName: "",
      type: "",
      category: initialCategory || "",
      startDate: null,
      endDate: null,
      minAmount: "",
      maxAmount: "",
    }

    setFilters(resetFilters)
    onFilter(initialCategory ? { category: initialCategory } : {})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="memberId">會員編號</Label>
          <Input
            id="memberId"
            value={filters.memberId}
            onChange={(e) => handleChange("memberId", e.target.value)}
            placeholder="輸入會員編號"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="memberName">會員名稱</Label>
          <Input
            id="memberName"
            value={filters.memberName}
            onChange={(e) => handleChange("memberName", e.target.value)}
            placeholder="輸入會員名稱"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">交易類別</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => handleChange("category", value)}
            disabled={!!initialCategory}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="選擇類別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部類別</SelectItem>
              {transactionCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">交易類型</Label>
          <Select value={filters.type} onValueChange={(value) => handleChange("type", value)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="選擇類型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部類型</SelectItem>
              {transactionTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">開始日期</Label>
          <DatePicker
            date={filters.startDate}
            setDate={(date) => handleChange("startDate", date)}
            placeholder="選擇開始日期"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">結束日期</Label>
          <DatePicker
            date={filters.endDate}
            setDate={(date) => handleChange("endDate", date)}
            placeholder="選擇結束日期"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minAmount">最小金額</Label>
          <Input
            id="minAmount"
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleChange("minAmount", e.target.value)}
            placeholder="最小金額"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAmount">最大金額</Label>
          <Input
            id="maxAmount"
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleChange("maxAmount", e.target.value)}
            placeholder="最大金額"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleReset}>
          重置
        </Button>
        <Button type="submit">篩選</Button>
      </div>
    </form>
  )
}

