import { getDatabase, closeDatabase } from "../lib/db/client"
import { readFileSync } from "fs"
import path from "path"

async function runMigrations() {
  console.log("Starting database migration...")

  try {
    const db = await getDatabase()

    // Read and execute schema SQL
    const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql")
    const schema = readFileSync(schemaPath, "utf-8")

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    console.log(`Executing ${statements.length} SQL statements...`)

    for (const statement of statements) {
      try {
        await db.run(statement)
      } catch (error: any) {
        // Skip errors for statements that already exist (like CREATE TABLE IF NOT EXISTS)
        if (!error.message?.includes("already exists")) {
          console.error(`Error executing statement: ${statement.substring(0, 50)}...`)
          throw error
        }
      }
    }

    console.log("Database schema created successfully!")

    await closeDatabase()
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

runMigrations()
