export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { calculateResults } from "@/lib/db/repositories/results"

export async function GET() {
  try {
    const results = await calculateResults()
     
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error calculating results:", error)
    return NextResponse.json({ error: "Failed to calculate results" }, { status: 500 })
  }
}
