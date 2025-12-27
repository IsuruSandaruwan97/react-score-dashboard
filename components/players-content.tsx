"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ScrollReveal from "@/components/scroll-reveal"

export default function PlayersContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [playersData, setPlayersData] = useState<any>(null)
  const [resultsData, setResultsData] = useState<any>(null)
  const [settingsData, setSettingsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersRes, resultsRes, settingsRes] = await Promise.all([
          fetch("/api/players"),
          fetch("/api/results"),
          fetch("/api/settings"),
        ])

        const players = await playersRes.json()
        const results = await resultsRes.json()
        const settings = await settingsRes.json()

        setPlayersData(players)
        setResultsData(results)
        setSettingsData(settings)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const playersWithResults = useMemo(() => {
    if (!playersData || !resultsData) return []

    return playersData.players.map((player: any) => {
      const result = resultsData.results.find((r: any) => r.playerId === player.id)
      return {
        ...player,
        totalScore: result?.totalScore || 0,
        rank: result?.rank || null,
      }
    })
  }, [playersData, resultsData])

  const filteredPlayers = useMemo(() => {
    let filtered = playersWithResults

    if (searchQuery) {
      try {
        const regex = new RegExp(searchQuery, "i")
        filtered = playersWithResults.filter(
          (player: any) =>
            regex.test(player.username) ||
            regex.test(player.minecraftUsername) ||
            regex.test(player.discordUsername) ||
            regex.test(player.id),
        )
      } catch (e) {
        filtered = playersWithResults.filter(
          (player: any) =>
            player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.minecraftUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.discordUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.id.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }
    }

    return filtered.sort((a: any, b: any) => {
      if (a.rank === null && b.rank === null) return b.totalScore - a.totalScore
      if (a.rank === null) return 1
      if (b.rank === null) return -1
      return a.rank - b.rank
    })
  }, [playersWithResults, searchQuery])

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading players...</div>
  }

  const resultsPublished = settingsData?.resultsPublished || false

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8 mx-auto max-w-md animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-pulse" />
          <Input
            type="text"
            placeholder="Search by username, Minecraft name, or Discord..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 hover-lift-glow transition-all"
          />
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="py-16 text-center animate-bounce-in">
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground animate-pulse" />
          <h3 className="mb-2 text-xl font-semibold">No players found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-sm text-muted-foreground animate-fade-in">
            Showing {filteredPlayers.length} of {playersWithResults.length} players
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlayers.map((player: any, index: number) => (
              <ScrollReveal key={player.id} delay={Math.min(index * 30, 500)}>
                <Card className="border-primary/20 bg-card p-6 hover-tilt hover-lift-glow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 animate-pulse group-hover:animate-bounce">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      {resultsPublished && player.rank && (
                        <Badge
                          variant={player.rank <= 3 ? "default" : "secondary"}
                          className={`animate-bounce-in ${
                            player.rank === 1
                              ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 animate-pulse-glow"
                              : player.rank === 2
                                ? "bg-gray-400/20 text-gray-400 border-gray-400/30"
                                : player.rank === 3
                                  ? "bg-orange-500/20 text-orange-500 border-orange-500/30"
                                  : ""
                          }`}
                        >
                          #{player.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="mb-4">
                      <h3 className="mb-1 text-lg font-bold">{player.username}</h3>
                      <p className="text-sm text-muted-foreground">ID: {player.id}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Minecraft:</span>
                        <span className="font-medium">{player.minecraftUsername}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Discord:</span>
                        <span className="font-medium">{player.discordUsername}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Team:</span>
                        <span className="font-medium">{player.team}</span>
                      </div>
                      {resultsPublished && player.totalScore > 0 && (
                        <div className="flex items-center justify-between border-t border-border pt-2">
                          <span className="text-muted-foreground">Total Score:</span>
                          <span className="font-bold text-primary animate-counter">{player.totalScore}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
