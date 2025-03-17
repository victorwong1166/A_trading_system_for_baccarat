import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function GET() {
  try {
    const result = await testConnection()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

