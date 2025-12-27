import { getDatabase, closeDatabase } from "../lib/db/client"
import { readFileSync } from "fs"
import path from "path"
import { upsertPlayer } from "../lib/db/repositories/players"
import { createJudge } from "../lib/db/repositories/judges"
import { createCriterion } from "../lib/db/repositories/criteria"
import { upsertScore } from "../lib/db/repositories/scores"
import { updateSettings } from "../lib/db/repositories/settings"

async function importJsonData() {
  console.log("Importing existing JSON data into database...")

  try {
    // Import Players
    console.log("Importing players...")
    const playersPath = path.join(process.cwd(), "data", "players.json")
    const playersData = JSON.parse(readFileSync(playersPath, "utf-8"))

    for (const player of playersData.players || []) {
      await upsertPlayer({
        id: player.id,
        username: player.username,
        ign: player.minecraftUsername || player.ign,
        discordUsername: player.discordUsername || "",
        team: player.team || "Solo",
        status: player.status || "active",
      })
    }
    console.log(`Imported ${playersData.players?.length || 0} players`)

    // Import Judges (skip if already seeded)
    console.log("Checking judges...")
    const judgesPath = path.join(process.cwd(), "data", "judges.json")
    const judgesData = JSON.parse(readFileSync(judgesPath, "utf-8"))

    const db = await getDatabase()
    const existingJudges = await db.query("SELECT COUNT(*) as count FROM judges")

    if (existingJudges[0].count === 0) {
      console.log("Importing judges...")
      for (const judge of judgesData.judges || []) {
        await createJudge({
          id: judge.id,
          name: judge.name,
          specialty: judge.specialty || judge.label || "",
          avatar: judge.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${judge.name}`,
          bio: judge.bio || "",
          active: judge.active !== false,
        })
      }
      console.log(`Imported ${judgesData.judges?.length || 0} judges`)
    } else {
      console.log("Judges already exist, skipping...")
    }

    // Import Criteria (skip if already seeded)
    console.log("Checking criteria...")
    const criteriaPath = path.join(process.cwd(), "data", "criteria.json")
    const criteriaData = JSON.parse(readFileSync(criteriaPath, "utf-8"))

    const existingCriteria = await db.query("SELECT COUNT(*) as count FROM criteria")

    if (existingCriteria[0].count === 0) {
      console.log("Importing criteria...")
      for (let i = 0; i < (criteriaData.criteria || []).length; i++) {
        const criterion = criteriaData.criteria[i]
        await createCriterion({
          id: criterion.id,
          name: criterion.name,
          description: criterion.description || "",
          maxPoints:  criterion.maxPoints || 20,
          displayOrder: criterion.order !== undefined ? criterion.order : i,
          active: criterion.active !== false,
        })
      }
      console.log(`Imported ${criteriaData.criteria?.length || 0} criteria`)
    } else {
      console.log("Criteria already exist, skipping...")
    }

    // Import Scores
    console.log("Importing scores...")
    const scoresPath = path.join(process.cwd(), "data", "scores.json")
    const scoresData = JSON.parse(readFileSync(scoresPath, "utf-8"))

    let scoreCount = 0
    for (const [round, playerScores] of Object.entries(scoresData)) {
      for (const playerScore of playerScores as any[]) {
        const playerId = playerScore.playerId
        const enteredBy = playerScore.updatedBy || "admin-1"

        for (const [judgeId, judgeScores] of Object.entries(playerScore.scores || {})) {
          for (const [criterionId, points] of Object.entries(judgeScores as any)) {
            if (points !== null && points !== undefined) {
              await upsertScore({
                playerId,
                judgeId,
                criterionId,
                round,
                points: Number(points),
                enteredBy,
              })
              scoreCount++
            }
          }
        }
      }
    }
    console.log(`Imported ${scoreCount} scores`)

    // Import Settings
    console.log("Importing settings...")
    const settingsPath = path.join(process.cwd(), "data", "settings.json")
    const settingsData = JSON.parse(readFileSync(settingsPath, "utf-8"))

    await updateSettings({
      resultsPublished: settingsData.resultsPublished || false,
      finalsEnabled: settingsData.finalsEnabled || false,
      currentRound: settingsData.currentRound || "qualification",
      qualificationLocked: settingsData.qualificationLocked || false,
      santaSleigh: settingsData.santaSleigh || {
        enabled: true,
        imageUrl: "/santa-sleigh.svg",
        width: 150,
        height: 100,
        minDelay: 10000,
        maxDelay: 30000,
        animationDuration: 12000,
      },
    })
    console.log("Settings imported successfully")

    console.log("\n✅ All data imported successfully!")

    await closeDatabase()
  } catch (error) {
    console.error("Import failed:", error)
    process.exit(1)
  }
}

importJsonData()
