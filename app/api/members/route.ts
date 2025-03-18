import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email } = body

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ message: "姓名和Email為必填欄位" }, { status: 400 })
    }

    // Check if member with email already exists
    const existingMember = await db.member.findUnique({
      where: { email },
    })

    if (existingMember) {
      return NextResponse.json({ message: "此Email已被使用" }, { status: 400 })
    }

    // Create member
    const member = await db.member.create({
      data: {
        name,
        email,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ message: "建立會員時發生錯誤" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const members = await db.member.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ message: "獲取會員資料時發生錯誤" }, { status: 500 })
  }
}

