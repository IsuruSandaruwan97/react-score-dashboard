import { NextResponse } from "next/server"
import { getAllJudges } from "@/lib/db/repositories/judges"

export async function GET() {
  try {
    const judges = await getAllJudges()
    return NextResponse.json({ judges })
  } catch (error) {
    console.error("[v0] Error fetching judges:", error)
    return NextResponse.json({ error: "Failed to fetch judges" }, { status: 500 })
  }
}
