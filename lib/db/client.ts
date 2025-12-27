import { getDatabaseConfig } from "./config"
import Database from "better-sqlite3"
import mysql from "mysql2/promise"
import { Pool } from "pg"

let dbInstance: any = null

export async function getDatabase() {
  if (dbInstance) return dbInstance

  const config = getDatabaseConfig()
  switch (config.type) {
    case "sqlite":
      const sqlite = new Database(config.path!)
      sqlite.pragma("journal_mode = WAL")
      dbInstance = {
        type: "sqlite" as const,
        db: sqlite,
        query: (sql: string, params: any[] = []) => {
          return sqlite.prepare(sql).all(...params)
        },
        run: (sql: string, params: any[] = []) => {
          return sqlite.prepare(sql).run(...params)
        },
        get: (sql: string, params: any[] = []) => {
          return sqlite.prepare(sql).get(...params)
        },
      }
      break

    case "mysql":
      const mysqlPool = mysql.createPool({
        host: config.mysqlHost,
        port: config.mysqlPort,
        user: config.mysqlUser,
        password: config.mysqlPassword,
        database: config.mysqlDatabase,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      })
      dbInstance = {
        type: "mysql" as const,
        db: mysqlPool,
        query: async (sql: string, params: any[] = []) => {
          const [rows] = await mysqlPool.execute(sql, params)
          return rows
        },
        run: async (sql: string, params: any[] = []) => {
          const [result] = await mysqlPool.execute(sql, params)
          return result
        },
        get: async (sql: string, params: any[] = []) => {
          const [rows] = await mysqlPool.execute(sql, params)
          return Array.isArray(rows) ? rows[0] : null
        },
      }
      break

    case "postgres":
      const pgPool = new Pool({
        host: config.postgresHost,
        port: config.postgresPort,
        user: config.postgresUser,
        password: config.postgresPassword,
        database: config.postgresDatabase,
        max: 10,
      })
      dbInstance = {
        type: "postgres" as const,
        db: pgPool,
        query: async (sql: string, params: any[] = []) => {
          const result = await pgPool.query(sql, params)
          return result.rows
        },
        run: async (sql: string, params: any[] = []) => {
          return await pgPool.query(sql, params)
        },
        get: async (sql: string, params: any[] = []) => {
          const result = await pgPool.query(sql, params)
          return result.rows[0] || null
        },
      }
      break
  }

  return dbInstance
}

export async function closeDatabase() {
  if (!dbInstance) return

  if (dbInstance.type === "sqlite") {
    dbInstance.db.close()
  } else if (dbInstance.type === "mysql") {
    await dbInstance.db.end()
  } else if (dbInstance.type === "postgres") {
    await dbInstance.db.end()
  }

  dbInstance = null
}
