export type DatabaseType = "sqlite" | "mysql" | "postgres"

export interface DatabaseConfig {
  type: DatabaseType
  // SQLite
  path?: string
  // MySQL
  mysqlHost?: string
  mysqlPort?: number
  mysqlUser?: string
  mysqlPassword?: string
  mysqlDatabase?: string
  // PostgreSQL
  postgresHost?: string
  postgresPort?: number
  postgresUser?: string
  postgresPassword?: string
  postgresDatabase?: string
}

export function getDatabaseConfig(): DatabaseConfig {
  const type = (process.env.DATABASE_TYPE || "sqlite") as DatabaseType

  const config: DatabaseConfig = { type }

  switch (type) {
    case "sqlite":
      config.path = process.env.DATABASE_PATH || "./data/competition.db"
      break
    case "mysql":
      config.mysqlHost = process.env.MYSQL_HOST || "localhost"
      config.mysqlPort = Number.parseInt(process.env.MYSQL_PORT || "3306")
      config.mysqlUser = process.env.MYSQL_USER || "root"
      config.mysqlPassword = process.env.MYSQL_PASSWORD || ""
      config.mysqlDatabase = process.env.MYSQL_DATABASE || "minecraft_competition"
      break
    case "postgres":
      config.postgresHost = process.env.POSTGRES_HOST || "localhost"
      config.postgresPort = Number.parseInt(process.env.POSTGRES_PORT || "5432")
      config.postgresUser = process.env.POSTGRES_USER || "postgres"
      config.postgresPassword = process.env.POSTGRES_PASSWORD || ""
      config.postgresDatabase = process.env.POSTGRES_DATABASE || "minecraft_competition"
      break
  }

  return config
}
