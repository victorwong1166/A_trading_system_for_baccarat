import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    // 獲取查詢參數
    const url = new URL(request.url)
    const init = url.searchParams.get("init") === "true"
    const force = url.searchParams.get("force") === "true"

    // 確定使用哪個環境變數
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!connectionString) {
      return NextResponse.json(
        {
          success: false,
          error: "No database connection string found in environment variables",
        },
        { status: 500 },
      )
    }

    // 創建 SQL 客戶端
    const sql = neon(connectionString)

    // 簡單的測試查詢
    const result = await sql`SELECT NOW() as time`

    // 檢查環境變數
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    }

    // 如果請求初始化數據庫
    if (init) {
      const logs = []
      const errors = []

      // 檢查表是否存在
      logs.push("Checking existing tables...")
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `

      const existingTables = tablesResult.map((row) => row.table_name)
      logs.push(`Found existing tables: ${existingTables.join(", ") || "none"}`)

      // 創建必要的表（如果不存在或強制重建）
      const tablesToCreate = [
        {
          name: "transactions",
          exists: existingTables.includes("transactions"),
          dropSql: "DROP TABLE IF EXISTS transactions CASCADE",
          createSql: `
            CREATE TABLE IF NOT EXISTS transactions (
              id SERIAL PRIMARY KEY,
              customer_id INTEGER,
              customer_name TEXT,
              amount DECIMAL(10, 2),
              type TEXT,
              description TEXT,
              status TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `,
          checkSql: "SELECT COUNT(*) as count FROM transactions",
          insertSql: `
            INSERT INTO transactions (customer_name, amount, type, description, status)
            VALUES 
              ('張三', 1000, '存款', '晚場存款', '已完成'),
              ('李四', 2000, '取款', '晚場取款', '已完成'),
              ('王五', 1500, '簽碼', '晚場簽碼', '待處理')
          `,
        },
        {
          name: "debts",
          exists: existingTables.includes("debts"),
          dropSql: "DROP TABLE IF EXISTS debts CASCADE",
          createSql: `
            CREATE TABLE IF NOT EXISTS debts (
              id SERIAL PRIMARY KEY,
              customer_id INTEGER,
              customer_name TEXT,
              amount DECIMAL(10, 2),
              description TEXT,
              paid BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `,
          checkSql: "SELECT COUNT(*) as count FROM debts",
          insertSql: `
            INSERT INTO debts (customer_name, amount, description, paid)
            VALUES 
              ('張三', 1000, '晚場借款', FALSE),
              ('李四', 2000, '晚場借款', FALSE)
          `,
        },
        {
          name: "settlements",
          exists: existingTables.includes("settlements"),
          dropSql: "DROP TABLE IF EXISTS settlements CASCADE",
          createSql: `
            CREATE TABLE IF NOT EXISTS settlements (
              id SERIAL PRIMARY KEY,
              settlement_id TEXT UNIQUE,
              period_number INTEGER,
              date DATE,
              total_revenue DECIMAL(10, 2),
              total_expenses DECIMAL(10, 2),
              net_profit DECIMAL(10, 2),
              notes TEXT,
              created_by INTEGER,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `,
          checkSql: "SELECT COUNT(*) as count FROM settlements",
          insertSql: "",
        },
        {
          name: "sign_records",
          exists: existingTables.includes("sign_records"),
          dropSql: "DROP TABLE IF EXISTS sign_records CASCADE",
          createSql: `
            CREATE TABLE IF NOT EXISTS sign_records (
              id SERIAL PRIMARY KEY,
              customer_name TEXT,
              amount DECIMAL(10, 2),
              table_number TEXT,
              status TEXT DEFAULT 'pending',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `,
          checkSql: "SELECT COUNT(*) as count FROM sign_records",
          insertSql: `
            INSERT INTO sign_records (customer_name, amount, table_number, status)
            VALUES 
              ('張三', 5000, 'A1', 'pending'),
              ('李四', 10000, 'B2', 'completed'),
              ('王五', 8000, 'C3', 'pending')
          `,
        },
      ]

      // 使用直接連接執行原始 SQL
      const executeRawSql = async (sqlText) => {
        // 創建一個新的連接
        const conn = neon(connectionString)
        try {
          // 執行 SQL
          return await conn(sqlText)
        } catch (error) {
          throw error
        }
      }

      // 如果強制重建，先刪除現有表
      if (force) {
        logs.push("Force rebuild enabled, dropping existing tables...")
        for (const table of tablesToCreate) {
          if (table.exists) {
            try {
              logs.push(`Dropping table: ${table.name}`)
              await executeRawSql(table.dropSql)
              table.exists = false
            } catch (error) {
              const errorMsg = `Error dropping table ${table.name}: ${error instanceof Error ? error.message : String(error)}`
              logs.push(errorMsg)
              errors.push(errorMsg)
            }
          }
        }
      }

      // 創建表
      const createdTables = []
      for (const table of tablesToCreate) {
        if (!table.exists) {
          try {
            logs.push(`Creating table: ${table.name}`)
            await executeRawSql(table.createSql)
            createdTables.push(table.name)
            table.exists = true
          } catch (error) {
            const errorMsg = `Error creating table ${table.name}: ${error instanceof Error ? error.message : String(error)}`
            logs.push(errorMsg)
            errors.push(errorMsg)
          }
        } else {
          logs.push(`Table ${table.name} already exists, skipping`)
        }
      }

      // 添加示例數據
      const populatedTables = []
      for (const table of tablesToCreate) {
        if (table.exists && table.insertSql) {
          try {
            // 檢查表是否為空
            logs.push(`Checking if ${table.name} is empty...`)
            const countResult = await executeRawSql(table.checkSql)
            const count = Number.parseInt(countResult[0]?.count || "0")

            if (count === 0 || force) {
              logs.push(`Adding sample data to ${table.name}`)
              await executeRawSql(table.insertSql)
              populatedTables.push(table.name)
            } else {
              logs.push(`Table ${table.name} already has data, skipping`)
            }
          } catch (error) {
            const errorMsg = `Error adding sample data to ${table.name}: ${error instanceof Error ? error.message : String(error)}`
            logs.push(errorMsg)
            errors.push(errorMsg)
          }
        }
      }

      return NextResponse.json({
        success: errors.length === 0,
        message: errors.length === 0 ? "數據庫初始化成功" : "數據庫初始化部分成功",
        time: result[0]?.time,
        envVars,
        tables: {
          existing: existingTables,
          created: createdTables,
          populated: populatedTables,
        },
        logs,
        errors: errors.length > 0 ? errors : undefined,
      })
    }

    // 如果只是測試連接
    return NextResponse.json({
      success: true,
      message: "數據庫連接成功",
      time: result[0]?.time,
      envVars,
      hint: "添加 ?init=true 參數來初始化數據庫，添加 &force=true 參數來強制重建表",
    })
  } catch (error) {
    console.error("數據庫操作錯誤:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

