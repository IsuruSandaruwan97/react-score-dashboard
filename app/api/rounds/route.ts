export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getAllRounds } from "@/lib/db/repositories/rounds"

export async function GET() {
  try {
    const rounds = await getAllRounds()

    const formattedRounds = rounds.map((round) => ({
      id: round.id,
      roundNumber: round.displayOrder,
      name: round.name,
      description: round.description,
      startDate: round.startDate,
      endDate: round.endDate,
      duration: round.timeLimit,
      status: round.status,
      theme: round.theme,
      maxPoints: 100,
    }))

    return NextResponse.json({ rounds: formattedRounds })
  } catch (error) {
    console.error("Error fetching rounds:", error)
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 })
  }
}
