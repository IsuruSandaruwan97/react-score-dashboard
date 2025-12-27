import { type NextRequest, NextResponse } from "next/server"
import { upsertScore } from "@/lib/db/repositories/scores"

export async function POST(request: NextRequest) {
  try {
    const { round, playerId, allJudgesScores, adminId } = await request.json()

    for (const [judgeId, judgeScores] of Object.entries(allJudgesScores)) {
      for (const [criterionId, points] of Object.entries(judgeScores as Record<string, number | null>)) {
        if (points !== null) {
          await upsertScore({
            playerId,
            judgeId,
            criterionId,
            round,
            points,
            enteredBy: adminId,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Scores saved successfully for all judges",
    })
  } catch (error) {
    console.error("[v0] Error saving player score:", error)
    return NextResponse.json({ success: false, error: "Failed to save score" }, { status: 500 })
  }
}
