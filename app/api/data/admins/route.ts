import { NextResponse } from "next/server"
import { getAllAdmins } from "@/lib/db/repositories/admins"

export async function GET() {
  try {
    const admins = await getAllAdmins()
    return NextResponse.json({ admins })
  } catch (error) {
    console.error("[v0] Error fetching admins:", error)
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 })
  }
}
