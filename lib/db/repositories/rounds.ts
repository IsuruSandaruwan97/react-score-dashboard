import { getDatabase } from "../client"

export interface Round {
  id: string
  name: string
  description: string
  theme: string
  timeLimit: string
  status: string
  startDate: string
  endDate: string
  displayOrder: number
  createdAt: string
}

export async function getAllRounds(): Promise<Round[]> {
  const db = await getDatabase()
  const rows = await db.query("SELECT * FROM rounds ORDER BY display_order")
  return rows.map(mapRoundFromDb)
}

export async function getRoundById(id: string): Promise<Round | null> {
  const db = await getDatabase()
  const row = await db.get("SELECT * FROM rounds WHERE id = ?", [id])
  return row ? mapRoundFromDb(row) : null
}

export async function createRound(round: Omit<Round, "createdAt">): Promise<void> {
  const db = await getDatabase()
  await db.run(
    `INSERT INTO rounds (id, name, description, theme, time_limit, status, start_date, end_date, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      round.id,
      round.name,
      round.description,
      round.theme,
      round.timeLimit,
      round.status,
      round.startDate,
      round.endDate,
      round.displayOrder,
    ],
  )
}

export async function updateRound(id: string, updates: Partial<Round>): Promise<void> {
  const db = await getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push("name = ?")
    values.push(updates.name)
  }
  if (updates.description !== undefined) {
    fields.push("description = ?")
    values.push(updates.description)
  }
  if (updates.theme !== undefined) {
    fields.push("theme = ?")
    values.push(updates.theme)
  }
  if (updates.timeLimit !== undefined) {
    fields.push("time_limit = ?")
    values.push(updates.timeLimit)
  }
  if (updates.status !== undefined) {
    fields.push("status = ?")
    values.push(updates.status)
  }
  if (updates.startDate !== undefined) {
    fields.push("start_date = ?")
    values.push(updates.startDate)
  }
  if (updates.endDate !== undefined) {
    fields.push("end_date = ?")
    values.push(updates.endDate)
  }
  if (updates.displayOrder !== undefined) {
    fields.push("display_order = ?")
    values.push(updates.displayOrder)
  }

  if (fields.length > 0) {
    values.push(id)
    await db.run(`UPDATE rounds SET ${fields.join(", ")} WHERE id = ?`, values)
  }
}

export async function deleteRound(id: string): Promise<void> {
  const db = await getDatabase()
  await db.run("DELETE FROM rounds WHERE id = ?", [id])
}

export async function upsertRound(round: Omit<Round, "createdAt">): Promise<void> {
  const existing = await getRoundById(round.id)
  if (existing) {
    await updateRound(round.id, round)
  } else {
    await createRound(round)
  }
}

function mapRoundFromDb(row: any): Round {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    theme: row.theme,
    timeLimit: row.time_limit,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  }
}
