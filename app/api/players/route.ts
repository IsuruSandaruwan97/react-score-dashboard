export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getAllPlayers } from "@/lib/db/repositories/players"

export async function GET() {
  try {
    const players = await getAllPlayers()

    const formattedPlayers = players.map((player) => ({
      id: player.id,
      username: player.username,
      minecraftUsername: player.ign,
      discordUsername: player.discordUsername || player.username,
      team: player.team,
      status: player.status,
    }))

    return NextResponse.json({ players: formattedPlayers })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}
