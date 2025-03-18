import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

// Create postgres connection
const client = postgres(process.env.DATABASE_URL)

// Create drizzle instance
export const db = drizzle(client, { schema })

// Helper function to test database connection
export async function testDatabaseConnection() {
  try {
    // Simple query to test connection
    const result = await client`SELECT NOW()`
    return { success: true, timestamp: result[0].now }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error: error.message }
  }
}

// SQL helper for raw queries
export const sql = postgres.sql

