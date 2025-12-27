import { getDatabase } from "../client"

export interface CompetitionInfo {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  maxPlayers: number
  status: string
  theme: string
  prizePool: string
  updatedAt: string
}

export async function getCompetitionInfo(): Promise<CompetitionInfo | null> {
  const db = await getDatabase()
  const row = await db.get("SELECT * FROM competition_info WHERE id = 1")
  return row ? mapCompetitionFromDb(row) : null
}

export async function upsertCompetitionInfo(info: Omit<CompetitionInfo, "id" | "updatedAt">): Promise<void> {
  const db = await getDatabase()

  const existing = await db.get("SELECT id FROM competition_info WHERE id = 1")

  if (existing) {
    await db.run(
      `UPDATE competition_info 
       SET name = ?, description = ?, start_date = ?, end_date = ?, 
           max_players = ?, status = ?, theme = ?, prize_pool = ?, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = 1`,
      [
        info.name,
        info.description,
        info.startDate,
        info.endDate,
        info.maxPlayers,
        info.status,
        info.theme,
        info.prizePool,
      ],
    )
  } else {
    await db.run(
      `INSERT INTO competition_info (id, name, description, start_date, end_date, max_players, status, theme, prize_pool)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        info.name,
        info.description,
        info.startDate,
        info.endDate,
        info.maxPlayers,
        info.status,
        info.theme,
        info.prizePool,
      ],
    )
  }
}

function mapCompetitionFromDb(row: any): CompetitionInfo {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    maxPlayers: row.max_players,
    status: row.status,
    theme: row.theme,
    prizePool: row.prize_pool,
    updatedAt: row.updated_at,
  }
}
