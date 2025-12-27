export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getAllJudges } from "@/lib/db/repositories/judges"
import { getAllCriteria } from "@/lib/db/repositories/criteria"

export async function GET() {
  try {
    const [judges, criteria] = await Promise.all([getAllJudges(), getAllCriteria()])

    const formattedCriteria = criteria.map((c) => ({
      name: c.name,
      description: c.description,
      weight: (c.maxPoints / criteria.reduce((sum, cr) => sum + cr.maxPoints, 0)) * 100,
    }))

    return NextResponse.json({
      judges: judges.map((judge) => ({
        id: judge.id,
        name: judge.name,
        role: "Judge",
        specialty: judge.specialty,
        bio: judge.bio,
        avatar: judge.avatar,
      })),
      scoringCriteria: formattedCriteria,
    })
  } catch (error) {
    console.error("Error fetching judges:", error)
    return NextResponse.json({ error: "Failed to fetch judges" }, { status: 500 })
  }
}
