import { getAllPlayers } from "./players"
import { getAllRounds } from "./rounds"
import { getAllCriteria } from "./criteria"
import { getScoresByPlayer, getWinners } from "./scores" // Declare the variable before using it

export interface PlayerResult {
  playerId: string
  username: string
  totalScore: number
  rank: number | null
  rounds: RoundResult[]
}

export interface RoundResult {
  roundId: string
  roundNumber: number
  totalScore: number
  scores: Record<string, number>
  feedback?: string
}

export async function calculateResults(): Promise<PlayerResult[]> {
  return await getWinners() 
}
