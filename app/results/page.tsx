"use client"
import ResultsContent from "@/components/results-content"
import SnowEffect from "@/components/snow-effect"
import SantaSleigh from "@/components/santa-sleigh"

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SnowEffect />
      <SantaSleigh />

      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-bounce-in text-gradient-animate">
              Results
            </h1> 
          </div>
        </div>
      </section>

      <ResultsContent />
    </div>
  )
}
