import { getDatabase } from "../client"

export interface Admin {
  id: string
  name: string
  username: string
  password: string
  email: string
  role: "main" | "normal"
  status: "active" | "inactive"
  requirePasswordChange: boolean
  lastLogin: string | null
  createdAt: string
}

export async function getAllAdmins(): Promise<Admin[]> {
  const db = await getDatabase()
  const rows = await db.query("SELECT * FROM admins ORDER BY created_at DESC")
  return rows.map(mapAdminFromDb)
}

export async function getAdminByUsername(username: string): Promise<Admin | null> {
  const db = await getDatabase()
  const row = await db.get("SELECT * FROM admins WHERE username = ?", [username])
  return row ? mapAdminFromDb(row) : null
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const db = await getDatabase()
  const row = await db.get("SELECT * FROM admins WHERE id = ?", [id])
  return row ? mapAdminFromDb(row) : null
}

export async function createAdmin(admin: Omit<Admin, "createdAt">): Promise<void> {
  const db = await getDatabase()
  await db.run(
    `INSERT INTO admins (id, name, username, password, email, role, status, require_password_change, last_login)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      admin.id,
      admin.name,
      admin.username,
      admin.password,
      admin.email,
      admin.role,
      admin.status,
      admin.requirePasswordChange ? 1 : 0,
      admin.lastLogin,
    ],
  )
}

export async function updateAdmin(id: string, updates: Partial<Admin>): Promise<void> {
  const db = await getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push("name = ?")
    values.push(updates.name)
  }
  if (updates.email !== undefined) {
    fields.push("email = ?")
    values.push(updates.email)
  }
  if (updates.password !== undefined) {
    fields.push("password = ?")
    values.push(updates.password)
  }
  if (updates.role !== undefined) {
    fields.push("role = ?")
    values.push(updates.role)
  }
  if (updates.status !== undefined) {
    fields.push("status = ?")
    values.push(updates.status)
  }
  if (updates.requirePasswordChange !== undefined) {
    fields.push("require_password_change = ?")
    values.push(updates.requirePasswordChange ? 1 : 0)
  }
  if (updates.lastLogin !== undefined) {
    fields.push("last_login = ?")
    values.push(updates.lastLogin)
  }

  if (fields.length > 0) {
    values.push(id)
    await db.run(`UPDATE admins SET ${fields.join(", ")} WHERE id = ?`, values)
  }
}

export async function deleteAdmin(id: string): Promise<void> {
  const db = await getDatabase()
  await db.run("DELETE FROM admins WHERE id = ?", [id])
}

function mapAdminFromDb(row: any): Admin {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    password: row.password,
    email: row.email,
    role: row.role,
    status: row.status,
    requirePasswordChange: Boolean(row.require_password_change),
    lastLogin: row.last_login,
    createdAt: row.created_at,
  }
}
