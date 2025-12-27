import { getDatabase } from "../client"

export interface Judge {
  id: string
  name: string
  specialty: string
  avatar: string
  bio: string
  active: boolean
  createdAt: string
}

export async function getAllJudges(): Promise<Judge[]> {
  const db = await getDatabase()
  const rows = await db.query("SELECT * FROM judges WHERE active <> ? ORDER BY name",[2])
  return rows.map(mapJudgeFromDb)
}

export async function getActiveJudges(): Promise<Judge[]> {
  const db = await getDatabase()
  const rows = await db.query("SELECT * FROM judges WHERE active = ? ORDER BY name", [1])
  return rows.map(mapJudgeFromDb)
}

export async function getJudgeById(id: string): Promise<Judge | null> {
  const db = await getDatabase()
  const row = await db.get("SELECT * FROM judges WHERE id = ?", [id])
  return row ? mapJudgeFromDb(row) : null
}

export async function createJudge(judge: Omit<Judge, "createdAt">): Promise<void> {
  const db = await getDatabase()
  await db.run(
    `INSERT INTO judges (id, name, specialty, avatar, bio, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [judge.id, judge.name, judge.specialty, judge.avatar, judge.bio, judge.active ? 1 : 0],
  )
}

export async function updateJudge(id: string, updates: Partial<Judge>): Promise<void> {
  const db = await getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push("name = ?")
    values.push(updates.name)
  }
  if (updates.specialty !== undefined) {
    fields.push("specialty = ?")
    values.push(updates.specialty)
  }
  if (updates.avatar !== undefined) {
    fields.push("avatar = ?")
    values.push(updates.avatar)
  }
  if (updates.bio !== undefined) {
    fields.push("bio = ?")
    values.push(updates.bio)
  }
  if (updates.active !== undefined) {
    fields.push("active = ?")
    values.push(updates.active ? 1 : 0)
  }

  if (fields.length > 0) {
    values.push(id)
    await db.run(`UPDATE judges SET ${fields.join(", ")} WHERE id = ?`, values)
  }
}

export async function deleteJudge(id: string): Promise<void> {
  const db = await getDatabase()
  await db.run("UPDATE judges SET active = 2 WHERE id = ?",[id]) 
}

function mapJudgeFromDb(row: any): Judge {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    avatar: row.avatar,
    bio: row.bio,
    active: Boolean(row.active),
    createdAt: row.created_at,
  }
}
