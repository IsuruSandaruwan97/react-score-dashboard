import { type NextRequest, NextResponse } from "next/server"
import { createJudge, updateJudge, deleteJudge } from "@/lib/db/repositories/judges"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, specialty, avatar, bio } = body

    console.log("[v0] Creating judge:", { name, specialty, avatar, bio })

    const newJudge = {
      id: `judge_${Date.now()}`,
      name,
      specialty: specialty || "",
      avatar: avatar || "",
      bio: bio || "",
      active: true,
    }

    await createJudge(newJudge)

    console.log("[v0] Judge created successfully")

    return NextResponse.json({ success: true, judge: newJudge })
  } catch (error) {
    console.error("[v0] Error creating judge:", error)
    return NextResponse.json({ error: "Failed to create judge" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, specialty, avatar, bio } = body

    console.log("[v0] Updating judge:", { id, name, specialty, avatar, bio })

    await updateJudge(id, { name, specialty, avatar, bio })

    console.log("[v0] Judge updated successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating judge:", error)
    return NextResponse.json({ error: "Failed to update judge" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Judge ID required" }, { status: 400 })
    }

    console.log("[v0] Deleting judge:", id)

    await deleteJudge(id)

    console.log("[v0] Judge deleted successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting judge:", error)
    return NextResponse.json({ error: "Failed to delete judge" }, { status: 500 })
  }
}
