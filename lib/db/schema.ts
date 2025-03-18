import { relations } from "drizzle-orm"
import { pgTable, serial, text, timestamp, boolean, uuid, decimal, pgEnum } from "drizzle-orm/pg-core"

// 交易類型枚舉
export const transactionTypeEnum = pgEnum("transaction_type", [
  "buy", // 買碼
  "redeem", // 兌碼
  "sign", // 簽碼
  "return", // 還碼
  "deposit", // 存款
  "withdrawal", // 取款
  "transfer", // 轉賬
  "labor", // 人工
  "misc", // 雜費
  "accounting", // 帳房
  "capital", // 本金
])

// 交易狀態枚舉
export const transactionStatusEnum = pgEnum("transaction_status", [
  "active", // 有效
  "canceled", // 已取消
])

// 會員類型枚舉
export const memberTypeEnum = pgEnum("member_type", [
  "regular", // 普通會員
  "vip", // VIP會員
  "agent", // 代理
  "shareholder", // 股東
])

// 用戶角色枚舉
export const userRoleEnum = pgEnum("user_role", [
  "admin", // 管理員
  "operator", // 操作員
  "viewer", // 只讀用戶
])

// 用戶表
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").default("operator").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 會員表
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: text("member_id").notNull().unique(), // 會員編號
  name: text("name").notNull(),
  phone: text("phone"),
  type: memberTypeEnum("type").default("regular").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0").notNull(),
  parentId: uuid("parent_id").references(() => members.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  notes: text("notes"),
})

// 交易記錄表
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: text("transaction_id").notNull().unique(), // 交易編號
  memberId: uuid("member_id").references(() => members.id),
  memberName: text("member_name"), // 冗餘存儲會員名稱，方便查詢
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  originalType: text("original_type"), // 用於特殊類型的交易，如雜費中的場租、系統等
  status: transactionStatusEnum("status").default("active").notNull(),
  description: text("description"),
  project: text("project"), // 項目名稱
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }),
  relatedTransactionId: uuid("related_transaction_id").references(() => transactions.id), // 關聯交易ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  canceledAt: timestamp("canceled_at"),
  canceledBy: uuid("canceled_by").references(() => users.id),
  cancelReason: text("cancel_reason"),
  ip: text("ip"), // 記錄IP地址
})

// 系統設置表
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// 系統日誌表
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  level: text("level").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 關係定義
export const usersRelations = relations(users, ({ many }) => ({
  createdMembers: many(members, { relationName: "creator" }),
  createdTransactions: many(transactions, { relationName: "creator" }),
  canceledTransactions: many(transactions, { relationName: "canceler" }),
  updatedSettings: many(settings, { relationName: "updater" }),
  logs: many(systemLogs, { relationName: "logger" }),
}))

export const membersRelations = relations(members, ({ one, many }) => ({
  parent: one(members, {
    fields: [members.parentId],
    references: [members.id],
  }),
  children: many(members, { relationName: "parent" }),
  creator: one(users, {
    fields: [members.createdBy],
    references: [users.id],
  }),
  transactions: many(transactions, { relationName: "member" }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  member: one(members, {
    fields: [transactions.memberId],
    references: [members.id],
  }),
  creator: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
  }),
  canceler: one(users, {
    fields: [transactions.canceledBy],
    references: [users.id],
  }),
  relatedTransaction: one(transactions, {
    fields: [transactions.relatedTransactionId],
    references: [transactions.id],
  }),
}))

export const settingsRelations = relations(settings, ({ one }) => ({
  updater: one(users, {
    fields: [settings.updatedBy],
    references: [users.id],
  }),
}))

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
}))

