import { relations } from "drizzle-orm"
import { pgTable, serial, text, timestamp, boolean, integer, uuid, decimal, pgEnum } from "drizzle-orm/pg-core"

// 交易類型枚舉
export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit", // 存款
  "withdrawal", // 取款
  "transfer", // 轉賬
  "bet", // 下注
  "win", // 贏錢
  "loss", // 輸錢
  "commission", // 佣金
  "adjustment", // 調整
  "credit", // 信用
  "repayment", // 還款
  "buy_chips",
  "redeem_chips",
  "manual",
])

// 交易狀態枚舉
export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending", // 待處理
  "completed", // 已完成
  "failed", // 失敗
  "cancelled", // 已取消
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

// 會員表
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: text("member_id").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  type: memberTypeEnum("type").default("regular").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  credit_limit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0").notNull(),
  parentId: uuid("parent_id").references(() => members.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  notes: text("notes"),
})

// 會員關係
export const membersRelations = relations(members, ({ one, many }) => ({
  parent: one(members, {
    fields: [members.parentId],
    references: [members.id],
  }),
  children: many(members),
  transactions: many(transactions),
}))

// 交易表
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").references(() => members.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").default("completed").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: uuid("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
})

// 交易關係
export const transactionsRelations = relations(transactions, ({ one }) => ({
  member: one(members, {
    fields: [transactions.memberId],
    references: [members.id],
  }),
  creator: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
  }),
  canceller: one(users, {
    fields: [transactions.cancelledBy],
    references: [users.id],
  }),
}))

// 系統用戶表
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").default("operator").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 用戶關係
export const usersRelations = relations(users, ({ many }) => ({
  created_transactions: many(transactions, { relationName: "creator" }),
  cancelled_transactions: many(transactions, { relationName: "canceller" }),
}))

// 系統設置表
export const systemSettings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
  category: text("category"),
})

// 設置關係
export const settingsRelations = relations(systemSettings, ({ one }) => ({
  updater: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}))

// 現金賬戶表
export const cashAccounts = pgTable("cash_accounts", {
  id: serial("id").primaryKey(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
})

// 現金交易表
export const cashTransactions = pgTable("cash_transactions", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  notes: text("notes"),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 交易記錄表
export const transactionRecords = pgTable("transaction_records", {
  id: serial("id").primaryKey(),
  recordId: text("record_id").notNull().unique(),
  transactionType: text("transaction_type").notNull(),
  memberId: text("member_id"),
  memberName: text("member_name"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  projectId: text("project_id"),
  projectName: text("project_name"),
  description: text("description"),
  status: text("status").notNull(),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  canceledAt: timestamp("canceled_at"),
  canceledBy: integer("canceled_by").references(() => users.id),
  cancelReason: text("cancel_reason"),
})

// 系統日誌表
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  level: text("level").notNull(), // Added level column
  message: text("message").notNull(), // Added message column
})

