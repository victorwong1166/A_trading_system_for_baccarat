"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Save } from "lucide-react"

interface SystemSetting {
  key: string
  value: string
  description: string
  type: "text" | "number" | "boolean" | "select"
  options?: { value: string; label: string }[]
}

interface SystemSettingsProps {
  settings: SystemSetting[]
  onSettingUpdated: (key: string, value: string) => void
}

export function SystemSettings({ settings, onSettingUpdated }: SystemSettingsProps) {
  const { toast } = useToast()
  const [updatedSettings, setUpdatedSettings] = useState<Record<string, string>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // 按類別分組設置
  const generalSettings = settings.filter((s) => s.key.startsWith("general."))
  const transactionSettings = settings.filter((s) => s.key.startsWith("transaction."))
  const memberSettings = settings.filter((s) => s.key.startsWith("member."))
  const securitySettings = settings.filter((s) => s.key.startsWith("security."))

  // 更新設置值
  const handleSettingChange = (key: string, value: string) => {
    setUpdatedSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 保存設置
  const handleSaveSettings = async () => {
    setIsUpdating(true)
    try {
      // 逐個更新設置
      for (const [key, value] of Object.entries(updatedSettings)) {
        await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, value }),
        })
        onSettingUpdated(key, value)
      }

      toast({
        title: "設置已更新",
        description: "系統設置已成功保存",
      })
      setUpdatedSettings({})
    } catch (error) {
      toast({
        title: "更新設置失敗",
        description: "請稍後再試或聯繫系統管理員",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // 渲染設置輸入控件
  const renderSettingInput = (setting: SystemSetting) => {
    const value = updatedSettings[setting.key] !== undefined ? updatedSettings[setting.key] : setting.value

    switch (setting.type) {
      case "boolean":
        return (
          <Switch
            checked={value === "true"}
            onCheckedChange={(checked) => handleSettingChange(setting.key, checked ? "true" : "false")}
          />
        )
      case "number":
        return <Input type="number" value={value} onChange={(e) => handleSettingChange(setting.key, e.target.value)} />
      case "select":
        return (
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      default:
        return <Input type="text" value={value} onChange={(e) => handleSettingChange(setting.key, e.target.value)} />
    }
  }

  // 渲染設置組
  const renderSettingGroup = (settingGroup: SystemSetting[]) => {
    return (
      <div className="space-y-4">
        {settingGroup.map((setting) => (
          <div key={setting.key} className="grid grid-cols-3 items-center gap-4">
            <div className="col-span-1">
              <Label htmlFor={setting.key}>
                {setting.key
                  .split(".")[1]
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </Label>
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            </div>
            <div className="col-span-2">{renderSettingInput(setting)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>系統設置</CardTitle>
        <Button onClick={handleSaveSettings} disabled={isUpdating || Object.keys(updatedSettings).length === 0}>
          {isUpdating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          保存設置
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">一般設置</TabsTrigger>
            <TabsTrigger value="transaction">交易設置</TabsTrigger>
            <TabsTrigger value="member">會員設置</TabsTrigger>
            <TabsTrigger value="security">安全設置</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4">
            {renderSettingGroup(generalSettings)}
          </TabsContent>
          <TabsContent value="transaction" className="mt-4">
            {renderSettingGroup(transactionSettings)}
          </TabsContent>
          <TabsContent value="member" className="mt-4">
            {renderSettingGroup(memberSettings)}
          </TabsContent>
          <TabsContent value="security" className="mt-4">
            {renderSettingGroup(securitySettings)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

