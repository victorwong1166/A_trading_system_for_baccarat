import { type NextRequest, NextResponse } from "next/server"
import { getAllMembers, getMembersWithDebt, createMember, searchMembers } from "@/lib/member-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const withDebt = searchParams.get("withDebt") === "true"

    let members
    if (query) {
      members = await searchMembers(query)
    } else if (withDebt) {
      members = await getMembersWithDebt()
    } else {
      members = await getAllMembers()
    }

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error in GET /api/members:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const userId = session.user.id

    const member = await createMember(data, userId)
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/members:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

