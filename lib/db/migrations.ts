import { db } from "./index"
import * as schema from "./schema"
import { sql } from "drizzle-orm"
import { generateId } from "../utils"
import bcrypt from "bcryptjs"

export async function initializeDatabase(force = false) {
  try {
    // 檢查數據庫是否已初始化
    const checkTable = async (tableName: string) => {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        );
      `)
      return result[0]?.exists || false
    }

    const usersExist = await checkTable("users")

    // 如果強制重建或表不存在，則創建表
    if (force || !usersExist) {
      console.log("Initializing database...")

      // 創建枚舉類型
      await db.execute(sql`DROP TYPE IF EXISTS "transaction_type" CASCADE;`)
      await db.execute(sql`DROP TYPE IF EXISTS "transaction_status" CASCADE;`)
      await db.execute(sql`DROP TYPE IF EXISTS "member_type" CASCADE;`)
      await db.execute(sql`DROP TYPE IF EXISTS "user_role" CASCADE;`)

      // 創建枚舉類型
      await db.execute(sql`
        CREATE TYPE "transaction_type" AS ENUM (
          'buy', 'redeem', 'sign', 'return', 'deposit', 'withdrawal', 
          'transfer', 'labor', 'misc', 'accounting', 'capital'
        );
      `)
      await db.execute(sql`
        CREATE TYPE "transaction_status" AS ENUM ('active', 'canceled');
      `)
      await db.execute(sql`
        CREATE TYPE "member_type" AS ENUM ('regular', 'vip', 'agent', 'shareholder');
      `)
      await db.execute(sql`
        CREATE TYPE "user_role" AS ENUM ('admin', 'operator', 'viewer');
      `)

      // 刪除現有表（如果存在）
      if (force) {
        await db.execute(sql`DROP TABLE IF EXISTS "system_logs" CASCADE;`)
        await db.execute(sql`DROP TABLE IF EXISTS "settings" CASCADE;`)
        await db.execute(sql`DROP TABLE IF EXISTS "transactions" CASCADE;`)
        await db.execute(sql`DROP TABLE IF EXISTS "members" CASCADE;`)
        await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE;`)
      }

      // 創建表
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "username" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" user_role NOT NULL DEFAULT 'operator',
          "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
          "last_login" TIMESTAMP,
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `)

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "members" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "member_id" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "phone" TEXT,
          "type" member_type NOT NULL DEFAULT 'regular',
          "balance" DECIMAL(10, 2) NOT NULL DEFAULT 0,
          "credit_limit" DECIMAL(10, 2) NOT NULL DEFAULT 0,
          "parent_id" UUID REFERENCES "members"("id"),
          "created_by" UUID REFERENCES "users"("id"),
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
          "notes" TEXT
        );
      `)

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "transactions" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "transaction_id" TEXT NOT NULL UNIQUE,
          "member_id" UUID REFERENCES "members"("id"),
          "member_name" TEXT,
          "amount" DECIMAL(10, 2) NOT NULL,
          "type" transaction_type NOT NULL,
          "original_type" TEXT,
          "status" transaction_status NOT NULL DEFAULT 'active',
          "description" TEXT,
          "project" TEXT,
          "balance_before" DECIMAL(10, 2),
          "balance_after" DECIMAL(10, 2),
          "related_transaction_id" UUID REFERENCES "transactions"("id"),
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "created_by" UUID NOT NULL REFERENCES "users"("id"),
          "canceled_at" TIMESTAMP,
          "canceled_by" UUID REFERENCES "users"("id"),
          "cancel_reason" TEXT,
          "ip" TEXT
        );
      `)

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "settings" (
          "key" TEXT PRIMARY KEY,
          "value" TEXT NOT NULL,
          "description" TEXT,
          "category" TEXT,
          "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updated_by" UUID REFERENCES "users"("id")
        );
      `)

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "system_logs" (
          "id" SERIAL PRIMARY KEY,
          "user_id" UUID REFERENCES "users"("id"),
          "action" TEXT NOT NULL,
          "details" TEXT,
          "ip_address" TEXT,
          "level" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `)

      // 創建索引
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_transactions_member_id" ON "transactions" ("member_id");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_transactions_type" ON "transactions" ("type");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_transactions_status" ON "transactions" ("status");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_transactions_created_at" ON "transactions" ("created_at");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_members_member_id" ON "members" ("member_id");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_members_name" ON "members" ("name");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_members_type" ON "members" ("type");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_settings_category" ON "settings" ("category");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_system_logs_level" ON "system_logs" ("level");`)
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_system_logs_created_at" ON "system_logs" ("created_at");`)

      // 創建默認管理員用戶
      const hashedPassword = await bcrypt.hash("admin123", 10)
      await db.insert(schema.users).values({
        username: "admin",
        password: hashedPassword,
        name: "系統管理員",
        role: "admin",
      })

      // 創建默認設置
      const defaultSettings = [
        { key: "system_name", value: "百家樂交易系統", description: "系統名稱", category: "general" },
        { key: "currency", value: "HKD", description: "貨幣單位", category: "general" },
        { key: "member_id_prefix", value: "M", description: "會員編號前綴", category: "members" },
        { key: "transaction_id_prefix", value: "T", description: "交易編號前綴", category: "transactions" },
      ]

      for (const setting of defaultSettings) {
        await db.insert(schema.settings).values(setting)
      }

      console.log("Database initialized successfully!")
      return { success: true, message: "Database initialized successfully!" }
    } else {
      console.log("Database already initialized.")
      return { success: true, message: "Database already initialized." }
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, message: `Error initializing database: ${error.message}` }
  }
}

export async function seedSampleData() {
  try {
    // 獲取管理員用戶ID
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin"),
    })

    if (!adminUser) {
      throw new Error("Admin user not found")
    }

    // 創建示例會員
    const sampleMembers = [
      { memberId: "M001", name: "張三", phone: "12345678", type: "regular" as const },
      { memberId: "M002", name: "李四", phone: "23456789", type: "vip" as const },
      { memberId: "M003", name: "王五", phone: "34567890", type: "agent" as const },
      { memberId: "M004", name: "趙六", phone: "45678901", type: "shareholder" as const },
    ]

    const createdMembers = []
    for (const member of sampleMembers) {
      const result = await db
        .insert(schema.members)
        .values({
          ...member,
          createdBy: adminUser.id,
        })
        .returning()
      createdMembers.push(result[0])
    }

    // 創建示例交易
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const sampleTransactions = [
      // 張三的交易
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[0].id,
        memberName: createdMembers[0].name,
        amount: 10000,
        type: "buy" as const,
        description: "買碼",
        balanceBefore: 0,
        balanceAfter: 10000,
        createdAt: yesterday,
      },
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[0].id,
        memberName: createdMembers[0].name,
        amount: -5000,
        type: "redeem" as const,
        description: "兌碼",
        balanceBefore: 10000,
        balanceAfter: 5000,
        createdAt: today,
      },
      // 李四的交易
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[1].id,
        memberName: createdMembers[1].name,
        amount: 20000,
        type: "buy" as const,
        description: "買碼",
        balanceBefore: 0,
        balanceAfter: 20000,
        createdAt: yesterday,
      },
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[1].id,
        memberName: createdMembers[1].name,
        amount: 5000,
        type: "sign" as const,
        description: "簽碼",
        balanceBefore: 20000,
        balanceAfter: 25000,
        createdAt: today,
      },
      // 王五的交易
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[2].id,
        memberName: createdMembers[2].name,
        amount: 30000,
        type: "deposit" as const,
        description: "存款",
        balanceBefore: 0,
        balanceAfter: 30000,
        createdAt: yesterday,
      },
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[2].id,
        memberName: createdMembers[2].name,
        amount: -10000,
        type: "withdrawal" as const,
        description: "取款",
        balanceBefore: 30000,
        balanceAfter: 20000,
        createdAt: today,
      },
      // 趙六的交易
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[3].id,
        memberName: createdMembers[3].name,
        amount: 50000,
        type: "capital" as const,
        description: "本金",
        balanceBefore: 0,
        balanceAfter: 50000,
        createdAt: yesterday,
      },
      {
        transactionId: `T${generateId(6)}`,
        memberId: createdMembers[3].id,
        memberName: createdMembers[3].name,
        amount: -5000,
        type: "misc" as const,
        originalType: "rent",
        description: "場租",
        balanceBefore: 50000,
        balanceAfter: 45000,
        createdAt: today,
      },
      // 系統交易（無會員）
      {
        transactionId: `T${generateId(6)}`,
        amount: -2000,
        type: "misc" as const,
        originalType: "system",
        description: "系統維護費",
        createdAt: today,
      },
      {
        transactionId: `T${generateId(6)}`,
        amount: -3000,
        type: "labor" as const,
        description: "人工費用",
        project: "系統開發",
        createdAt: today,
      },
    ]

    for (const transaction of sampleTransactions) {
      await db.insert(schema.transactions).values({
        ...transaction,
        createdBy: adminUser.id,
      })
    }

    // 更新會員餘額
    await db.execute(sql`
      UPDATE "members"
      SET "balance" = (
        SELECT COALESCE(SUM("amount"), 0)
        FROM "transactions"
        WHERE "transactions"."member_id" = "members"."id"
        AND "transactions"."status" = 'active'
      )
    `)

    console.log("Sample data seeded successfully!")
    return { success: true, message: "Sample data seeded successfully!" }
  } catch (error) {
    console.error("Error seeding sample data:", error)
    return { success: false, message: `Error seeding sample data: ${error.message}` }
  }
}

