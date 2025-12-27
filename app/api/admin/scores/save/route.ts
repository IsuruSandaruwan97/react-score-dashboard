import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { round, scores, adminId } = body

    if (!round || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const scoresPath = path.join(process.cwd(), "data", "scores.json")
    const scoresData = JSON.parse(fs.readFileSync(scoresPath, "utf-8"))

    // Convert scores Map to proper structure
    const playerScoresMap = new Map<string, any>()

    // Group scores by player
    for (const [key, value] of Object.entries(scores)) {
      const [playerId, judgeId, criterionId] = key.split("-")

      if (!playerScoresMap.has(playerId)) {
         const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        playerScoresMap.set(playerId, {
          playerId,
          scores: {},
          updatedAt,
          updatedBy: adminId || "unknown",
        })
      }

      const playerScore = playerScoresMap.get(playerId)

      if (!playerScore.scores[judgeId]) {
        playerScore.scores[judgeId] = {}
      }

      playerScore.scores[judgeId][criterionId] = value
    }

    // Update the scores for the specific round
    scoresData[round] = Array.from(playerScoresMap.values())

    // Write back to file
    fs.writeFileSync(scoresPath, JSON.stringify(scoresData, null, 2))

    return NextResponse.json({ success: true, message: "Scores saved successfully" })
  } catch (error) {
    console.error("[v0] Error saving scores:", error)
    return NextResponse.json({ error: "Failed to save scores" }, { status: 500 })
  }
}
