import { type NextRequest, NextResponse } from "next/server"
import { updateSettings } from "@/lib/db/repositories/settings"

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json()

    await updateSettings(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
