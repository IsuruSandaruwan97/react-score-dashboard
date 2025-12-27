import { getDatabase, closeDatabase } from "../lib/db/client"
import { hashPassword } from "../lib/password-utils"

async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    const db = await getDatabase()

    // Check if data already exists
    const existingAdmin = await db.get("SELECT id FROM admins WHERE username = ?", ["mainuser"])

    if (existingAdmin) {
      console.log("Database already seeded. Skipping...")
      await closeDatabase()
      return
    }

    console.log("Seeding admins...")
    const mainAdminPassword = await hashPassword("admin123")

    await db.run(
      `INSERT INTO admins (id, name, username, password, email, role, status, require_password_change, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "admin-1",
        "Main Administrator",
        "mainuser",
        mainAdminPassword,
        "admin@cwresports.lk",
        "main",
        "active",
        0,
        null,
      ],
    )

    console.log("Seeding settings...")
    await db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["resultsPublished", "false"])
    await db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["finalsEnabled", "false"])
    await db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["currentRound", "qualification"])
    await db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["qualificationLocked", "false"])

    const santaSleighSettings = JSON.stringify({
      enabled: true,
      imageUrl: "/santa-sleigh.svg",
      width: 150,
      height: 100,
      minDelay: 10000,
      maxDelay: 30000,
      animationDuration: 12000,
    })
    await db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["santaSleigh", santaSleighSettings])

    console.log("Seeding judges...")
    await db.run(
      `INSERT INTO judges (id, name, specialty, avatar, bio, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "judge-1",
        "Alex Stone",
        "Architecture & Design",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        "Master builder with 8 years of experience in creative construction",
        1,
      ],
    )

    await db.run(
      `INSERT INTO judges (id, name, specialty, avatar, bio, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "judge-2",
        "Sarah Chen",
        "Redstone & Mechanics",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        "Redstone engineer specializing in complex mechanical builds",
        1,
      ],
    )

    await db.run(
      `INSERT INTO judges (id, name, specialty, avatar, bio, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "judge-3",
        "Marcus Rivera",
        "Creativity & Theme",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        "Creative director focused on theme interpretation and originality",
        1,
      ],
    )

    console.log("Seeding criteria...")
    await db.run(
      `INSERT INTO criteria (id, name, description, max_points, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["criteria-1", "Creativity & Originality", "Innovation and unique design elements", 20, 0, 1],
    )

    await db.run(
      `INSERT INTO criteria (id, name, description, max_points, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["criteria-2", "Technical Skill", "Building techniques and complexity", 20, 1, 1],
    )

    await db.run(
      `INSERT INTO criteria (id, name, description, max_points, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["criteria-3", "Theme Adherence", "How well the build matches the theme", 20, 2, 1],
    )

    await db.run(
      `INSERT INTO criteria (id, name, description, max_points, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["criteria-4", "Detail & Polish", "Attention to detail and finishing touches", 20, 3, 1],
    )

    await db.run(
      `INSERT INTO criteria (id, name, description, max_points, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["criteria-5", "Overall Impact", "Visual appeal and wow factor", 20, 4, 1],
    )

    console.log("Database seeded successfully!")
    console.log("\nDefault credentials:")
    console.log("Username: mainuser")
    console.log("Password: admin123")

    await closeDatabase()
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

seedDatabase()
