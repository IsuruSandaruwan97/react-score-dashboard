import { NextResponse } from "next/server"
import { getScoresByRound } from "@/lib/db/repositories/scores"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const round = searchParams.get("round") || "qualification"

    const scores = await getScoresByRound(round)

    // Transform to match expected format
    const scoresByRound: Record<string, any[]> = {}
    scoresByRound[round] = []

    // Group by player
    const playerScores = new Map()

    for (const score of scores) {
      if (!playerScores.has(score.playerId)) {
        playerScores.set(score.playerId, {
          playerId: score.playerId,
          scores: {},
          lastUpdated: score.enteredAt,
          updatedBy: score.enteredBy,
        })
      }

      const playerScore = playerScores.get(score.playerId)
      if (!playerScore.scores[score.judgeId]) {
        playerScore.scores[score.judgeId] = {}
      }
      playerScore.scores[score.judgeId][score.criterionId] = score.points
    }

    scoresByRound[round] = Array.from(playerScores.values())

    return NextResponse.json(scoresByRound)
  } catch (error) {
    console.error("[v0] Error fetching scores:", error)
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 })
  }
}
