

import { upsertPlayer, getAllPlayers } from "@/lib/db/repositories/players"
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"


function normalizeKey(k: string) {
  return k.trim().toLowerCase()
}


function getField(row: any, ...candidates: string[]) {
  const map = new Map<string, any>()
  for (const [k, v] of Object.entries(row ?? {})) map.set(normalizeKey(k), v)

  for (const c of candidates) {
    const v = map.get(normalizeKey(c))
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim()
  }
  return ""
}

function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim())
  const rows: Array<Record<string, string>> = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    rows.push(row)
  }

  return rows
}


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let uploadedPlayers: any[] = []

    // Decide by MIME or extension
    const name = (file as any).name ?? ""
    const isXlsx =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      name.toLowerCase().endsWith(".xlsx")

    const isCsv =
      file.type === "text/csv" ||
      file.type === "application/csv" ||
      name.toLowerCase().endsWith(".csv")

    if (isXlsx) {
      // Read XLSX (first sheet)
      const workbook = XLSX.read(buffer, { type: "buffer" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      uploadedPlayers = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[]
    } else if (isCsv) {
      const content = buffer.toString("utf-8")
      uploadedPlayers = parseCSV(content) // your existing CSV parser
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .csv or .xlsx file." },
        { status: 400 }
      )
    }

    if (uploadedPlayers.length === 0) {
      return NextResponse.json({ error: "No valid data found in file" }, { status: 400 })
    }

    let added = 0
    let updated = 0

    const existingPlayers = await getAllPlayers()

    for (const row of uploadedPlayers) {
      // tolerate variations in headers
      const id = getField(row, "ID", "Id", "id")
      const username = getField(row, "Username", "User Name", "username")
      const minecraft = getField(row, "Minecraft Username", "Minecraft", "IGN")
      const discord = getField(row, "Discord Username", "Discord", "Discord Name")
      const team = getField(row, "Team", "team") || "Solo"
      const status = getField(row, "Status", "status") || "active"

      if (!id || !username) continue

      const playerData = {
        id,
        username,
        ign: minecraft || username,
        discordUsername: discord || "",
        team,
        status,
      }

      const exists = existingPlayers.some((p) => p.id === playerData.id)

      await upsertPlayer(playerData)

      if (exists) updated++
      else added++
    }

    const totalPlayers = await getAllPlayers()

    return NextResponse.json({
      message: `Successfully processed ${uploadedPlayers.length} players`,
      stats: { added, updated, total: totalPlayers.length },
    })
  } catch (error) {
    console.error("[v0] Player upload error:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}
