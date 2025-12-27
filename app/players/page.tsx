import { Suspense } from "react"
import PlayersContent from "@/components/players-content"
import SnowEffect from "@/components/snow-effect"
import SantaSleigh from "@/components/santa-sleigh"

export default async function PlayersPage() {
  return (
    <div className="min-h-screen bg-background">
      <SnowEffect />
      <SantaSleigh />

      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Competition Players</h1>
            <p className="mb-6 text-lg text-muted-foreground">Competing builders from around the world</p>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="container mx-auto px-4 py-12">Loading...</div>}>
        <PlayersContent />
      </Suspense>
    </div>
  )
}
