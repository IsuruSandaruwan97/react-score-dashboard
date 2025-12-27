"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ScrollReveal from "@/components/scroll-reveal"

export default function ResultsContent() {
  const [resultsData, setResultsData] = useState<any>(null)
  const [roundsData, setRoundsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [resultsRes, roundsRes] = await Promise.all([fetch("/api/results"), fetch("/api/rounds")])

        const results = await resultsRes.json()
        const rounds = await roundsRes.json()

        setResultsData(results)
        setRoundsData(rounds)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !resultsData || !roundsData) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading results...</div>
  }

  const sortedResults = [...resultsData.results].sort((a: any, b: any) => {
    if (a.rank === null && b.rank === null) return b.totalScore - a.totalScore
    if (a.rank === null) return 1
    if (b.rank === null) return -1
    return a.rank - b.rank
  })

  const getRankIcon = (rank: number | null) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />
    return null
  }

  const getRankBadgeClass = (rank: number | null) => {
    if (rank === 1) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    if (rank === 2) return "bg-gray-400/20 text-gray-400 border-gray-400/30"
    if (rank === 3) return "bg-orange-500/20 text-orange-500 border-orange-500/30"
    return ""
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {sortedResults.length >= 3 && (
        <section className="mb-12">
          <ScrollReveal>
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl animate-bounce-in">Top 3 Leaders</h2>
          </ScrollReveal>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {/* 2nd Place */}
            {sortedResults[1] && (
              <ScrollReveal delay={100}>
                <Card className="order-1 neon-border bg-gradient-to-br from-gray-400/5 to-background p-6 md:order-1 hover-tilt hover-lift-glow animate-slide-right relative overflow-hidden group">
                  <div className="absolute inset-0 animate-shimmer opacity-30" />
                  <div className="relative z-10">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-400/10 animate-pulse-glow">
                        <Medal className="h-10 w-10 text-gray-400 group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="mb-4 text-center">
                      <Badge className="mb-2 bg-gray-400/20 text-gray-400 border-gray-400/30 animate-bounce-in">
                        2nd Place
                      </Badge>
                      <h3 className="text-2xl font-bold">{sortedResults[1].username}</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary animate-counter">
                        {sortedResults[1].totalScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            )}

            {/* 1st Place */}
            {sortedResults[0] && (
              <ScrollReveal delay={0}>
                <Card className="order-2 neon-border bg-gradient-to-br from-yellow-500/10 to-background p-8 md:order-2 md:-mt-4 hover-tilt hover-lift-glow animate-bounce-in relative overflow-hidden group">
                  <div className="absolute inset-0 animate-shimmer opacity-40" />
                  <div className="relative z-10">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500/10 animate-pulse-glow">
                        <Trophy className="h-12 w-12 text-yellow-500 animate-float group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="mb-4 text-center">
                      <Badge className="mb-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/30 animate-pulse-glow">
                        1st Place - Champion
                      </Badge>
                      <h3 className="text-3xl font-bold">{sortedResults[0].username}</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary animate-counter">
                        {sortedResults[0].totalScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            )}

            {/* 3rd Place */}
            {sortedResults[2] && (
              <ScrollReveal delay={200}>
                <Card className="order-3 neon-border bg-gradient-to-br from-orange-500/5 to-background p-6 md:order-3 hover-tilt hover-lift-glow animate-slide-left relative overflow-hidden group">
                  <div className="absolute inset-0 animate-shimmer opacity-30" />
                  <div className="relative z-10">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 animate-pulse-glow">
                        <Award className="h-10 w-10 text-orange-500 group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="mb-4 text-center">
                      <Badge className="mb-2 bg-orange-500/20 text-orange-500 border-orange-500/30 animate-bounce-in">
                        3rd Place
                      </Badge>
                      <h3 className="text-2xl font-bold">{sortedResults[2].username}</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary animate-counter">
                        {sortedResults[2].totalScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            )}
          </div>
        </section>
      )}

      <section>
        <ScrollReveal>
          <h2 className="mb-6 text-2xl font-bold md:text-3xl animate-slide-up">Full Leaderboard</h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Card className="overflow-hidden border-primary/20 bg-card animate-scale-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Player</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total Score</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Rounds Played</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedResults.map((result: any, index: number) => (
                    <tr
                      key={result.playerId}
                      className={`transition-all hover:bg-muted/50 hover:scale-[1.01] ${index < 3 ? "bg-primary/5" : ""}`}
                      style={{
                        animation: `slideRight 0.5s ease-out ${index * 0.05}s backwards`,
                      }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(result.rank)}
                          {result.rank && <Badge className={getRankBadgeClass(result.rank)}>#{result.rank}</Badge>}
                          {!result.rank && <span className="text-muted-foreground">-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold">{result.username}</div>
                        <div className="text-sm text-muted-foreground">{result.playerId}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-lg font-bold text-primary">{result.totalScore}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-muted-foreground">{result.rounds.length}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </ScrollReveal>
      </section>

     
    </div>
  )
}
