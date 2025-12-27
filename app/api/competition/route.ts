export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getCompetitionInfo } from "@/lib/db/repositories/competition"
import { getAllPlayers } from "@/lib/db/repositories/players"
import { getAllRounds } from "@/lib/db/repositories/rounds"

export async function GET() {
  try {
    const [competitionInfo, players, rounds] = await Promise.all([
      getCompetitionInfo(),
      getAllPlayers(),
      getAllRounds(),
    ])

    if (!competitionInfo) {
      return NextResponse.json({ error: "Competition info not found" }, { status: 404 })
    }

    const currentRound = rounds.find((r) => r.status === "ongoing")

    return NextResponse.json({
      name: competitionInfo.name,
      description: competitionInfo.description,
      status: competitionInfo.status,
      startDate: competitionInfo.startDate,
      endDate: competitionInfo.endDate,
      totalPlayers: players.length,
      totalRounds: rounds.length,
      currentRound: currentRound?.displayOrder || 1,
      prizePool: competitionInfo.prizePool,
      theme: competitionInfo.theme,
      rules: [
        "Build within designated plot boundaries",
        "No mods or texture packs allowed",
        "3 hours per round",
        "Original designs only",
        "Family-friendly builds",
      ],
    })
  } catch (error) {
    console.error("Error fetching competition info:", error)
    return NextResponse.json({ error: "Failed to fetch competition info" }, { status: 500 })
  }
}
