import {
  CreditCard,
  DollarSign,
  FileText,
  ArrowLeftRight,
  Users,
  Settings,
  Briefcase,
  PiggyBank,
  Wallet,
  ReceiptText,
  Banknote,
} from "lucide-react"

// 交易類型定義
export const transactionTypes = [
  { id: "buy", name: "買碼", icon: CreditCard },
  { id: "redeem", name: "兌碼", icon: DollarSign },
  { id: "sign", name: "簽碼", icon: FileText },
  { id: "return", name: "還碼", icon: FileText },
  { id: "deposit", name: "存款", icon: PiggyBank },
  { id: "withdrawal", name: "取款", icon: Wallet },
  { id: "transfer", name: "轉賬", icon: ArrowLeftRight },
  { id: "labor", name: "人工", icon: Users },
  { id: "misc", name: "雜費", icon: ReceiptText },
  { id: "accounting", name: "帳房", icon: Settings },
  { id: "capital", name: "本金", icon: Briefcase },
]

// 交易類別定義
export const transactionCategories = [
  { id: "chips", name: "碼量", types: ["buy", "redeem", "sign", "return"] },
  { id: "money", name: "資金", types: ["deposit", "withdrawal", "transfer"] },
  { id: "expense", name: "費用", types: ["labor", "misc"] },
  { id: "accounting", name: "會計", types: ["accounting", "capital"] },
]

// 獲取交易類型名稱
export function getTransactionTypeName(type: string): string {
  const typeObj = transactionTypes.find((t) => t.id === type)
  return typeObj ? typeObj.name : type
}

// 獲取交易類型圖標
export function getTransactionTypeIcon(type: string): any {
  const typeObj = transactionTypes.find((t) => t.id === type)
  return typeObj ? typeObj.icon : Banknote
}

// 獲取交易類型顏色
export function getTransactionTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    buy: "text-green-600",
    redeem: "text-red-600",
    sign: "text-blue-600",
    return: "text-orange-600",
    deposit: "text-green-600",
    withdrawal: "text-red-600",
    transfer: "text-purple-600",
    labor: "text-yellow-600",
    misc: "text-gray-600",
    accounting: "text-indigo-600",
    capital: "text-teal-600",
  }

  return colorMap[type] || "text-gray-600"
}

// 獲取交易類別名稱
export function getTransactionCategoryName(type: string): string {
  for (const category of transactionCategories) {
    if (category.types.includes(type)) {
      return category.name
    }
  }
  return "其他"
}

// 獲取交易類別
export function getTransactionCategory(type: string): string {
  for (const category of transactionCategories) {
    if (category.types.includes(type)) {
      return category.id
    }
  }
  return "other"
}

