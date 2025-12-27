import { type NextRequest, NextResponse } from "next/server"
import { reorderCriteria } from "@/lib/db/repositories/criteria"

export async function POST(req: NextRequest) {
  try {
    const { criteria } = await req.json()

    if (!criteria || !Array.isArray(criteria)) {
      return NextResponse.json({ error: "Invalid criteria data" }, { status: 400 })
    }

    const orderedIds = criteria.map((c: any) => c.id)
    await reorderCriteria(orderedIds)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error reordering criteria:", error)
    return NextResponse.json({ error: "Failed to reorder criteria" }, { status: 500 })
  }
}
