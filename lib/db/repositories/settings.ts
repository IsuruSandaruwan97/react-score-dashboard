import { getDatabase } from "../client"

export interface Settings {
  resultsPublished: boolean
  finalsEnabled: boolean
  currentRound: string
  qualificationLocked: boolean
  santaSleigh: {
    enabled: boolean
    imageUrl: string
    width: number
    height: number
    minDelay: number
    maxDelay: number
    animationDuration: number
  }
}

export async function getSettings(): Promise<Settings> {
  const db = await getDatabase()
  const rows = await db.query("SELECT * FROM settings")
 
  const settingsMap: Record<string, string> = {}
  for (const row of rows) {
     
    settingsMap[row.setting_key] = row.value
  } 
  return { 
    resultsPublished: settingsMap.resultsPublished === "true",
    finalsEnabled: settingsMap.finalsEnabled === "true",
    currentRound: settingsMap.currentRound || "qualification",
    qualificationLocked: settingsMap.qualificationLocked === "true",
    santaSleigh: settingsMap.santaSleigh
      ? JSON.parse(settingsMap.santaSleigh)
      : {
          enabled: true,
          imageUrl: "/santa-sleigh.svg",
          width: 150,
          height: 100,
          minDelay: 10000,
          maxDelay: 30000,
          animationDuration: 12000,
        },
  }
}

export async function updateSetting(key: string, value: any): Promise<void> {
  const db = await getDatabase()
  const valueStr = typeof value === "object" ? JSON.stringify(value) : String(value)
 
  const existing = await db.get("SELECT setting_key FROM settings WHERE setting_key = ?", [key])
 
  if (existing) {
    await db.run("UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?", [valueStr, key])
  } else {
    await db.run("INSERT INTO settings (setting_key, value) VALUES (?, ?)", [key, valueStr])
  }
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    await updateSetting(key, value)
  }
}
