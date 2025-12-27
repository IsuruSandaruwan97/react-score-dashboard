 
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SnowEffect from "@/components/snow-effect"
import SantaSleigh from "@/components/santa-sleigh"
import CurtainPreloader from "@/components/curtain-preloader"
import { Trophy, Medal, Award } from "lucide-react"

import { getSettings } from "@/lib/db/repositories/settings"
import Image from "next/image"

async function getCompetitionData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/competition`, {
      cache: "no-store",
    })
    if (!response.ok) throw new Error("Failed to fetch competition")
    return await response.json()
  } catch (error) {
    console.error("Error fetching competition:", error)
    return null
  }
}

async function getTopResults() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/results`, {
      cache: "no-store",
    })
    if (!response.ok) throw new Error("Failed to fetch results")
    const data = await response.json()
    return data.results.slice(0, 10) // Get top 10 players
  } catch (error) {
    console.error("Error fetching results:", error)
    return []
  }
}

export default async function HomePage() {
  const [competition, settings] = await Promise.all([getCompetitionData(), getSettings()]) 
  const topResults = settings?.resultsPublished ? await getTopResults() : []

  if (!competition) {
    return <div>Loading...</div>
  }

  const podiumPlayers = topResults.slice(0, 3)
  const remainingPlayers:any = topResults.slice(3, 10)

  return (
    <div className="min-h-screen bg-background">
      <CurtainPreloader />
      <SnowEffect />
      <SantaSleigh />

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container relative mx-auto px-4 py-16 md:py-24 min-h-screen flex items-center justify-center">
          <div className="mx-auto my-auto max-w-6xl w-full text-center">
            <div className="animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-pulse-glow">
                <Image src="/logo.png" alt="CWR Network" width={360} height={128} className="h-28 w-auto" priority />
              </div>
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl animate-bounce-in text-gradient-animate">
                {competition.name}
              </h1>
              <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl animate-slide-up">
                {competition.description}
              </p>

              {settings.resultsPublished && topResults.length > 0 && (
                <div className="mt-12 space-y-8">
                  <h2 className="text-3xl font-bold mb-8">🏆 Competition Winners</h2>

                  {/* Podium - Top 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                    {/* 2nd Place */}
                    {podiumPlayers[1] && (
                      <Card className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-300 dark:border-slate-600 md:order-1">
                        <div className="flex flex-col items-center gap-3">
                          <Medal className="w-12 h-12 text-slate-400" />
                          <Badge variant="secondary" className="text-lg px-4 py-1">
                            2nd Place
                          </Badge>
                          <h3 className="text-xl font-bold">{podiumPlayers[1].username}</h3>
                          <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                            {podiumPlayers[1].totalScore} pts
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* 1st Place */}
                    {podiumPlayers[0] && (
                      <Card className="p-8 bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-900 dark:to-amber-950 border-2 border-yellow-400 dark:border-yellow-600 md:order-2 md:-mt-4 shadow-xl">
                        <div className="flex flex-col items-center gap-4">
                          <Trophy className="w-16 h-16 text-yellow-500" />
                          <Badge className="text-xl px-6 py-2 bg-yellow-500 hover:bg-yellow-600">1st Place</Badge>
                          <h3 className="text-2xl font-bold">{podiumPlayers[0].username}</h3>
                          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {podiumPlayers[0].totalScore} pts
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* 3rd Place */}
                    {podiumPlayers[2] && (
                      <Card className="p-6 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900 dark:to-amber-950 border-2 border-orange-300 dark:border-orange-600 md:order-3">
                        <div className="flex flex-col items-center gap-3">
                          <Award className="w-12 h-12 text-orange-400" />
                          <Badge variant="secondary" className="text-lg px-4 py-1 bg-orange-200 dark:bg-orange-800">
                            3rd Place
                          </Badge>
                          <h3 className="text-xl font-bold">{podiumPlayers[2].username}</h3>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                            {podiumPlayers[2].totalScore} pts
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Remaining Top 10 (4th-10th) */}
                  {remainingPlayers.length > 0 && (
                    <div className="max-w-2xl mx-auto">
                      <h3 className="text-xl font-semibold mb-4">Top 10 Players</h3>
                      <div className="space-y-2">
                        {remainingPlayers?.map((player:any, index:number) => (
                          <Card
                            key={player.playerId}
                            className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="text-lg w-12 justify-center">
                                {index + 4}
                              </Badge>
                              <span className="font-semibold text-lg">{player.username}</span>
                            </div>
                            <span className="text-lg font-bold text-muted-foreground">{player.totalScore} pts</span>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                 
                </div>
              )}

             
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
