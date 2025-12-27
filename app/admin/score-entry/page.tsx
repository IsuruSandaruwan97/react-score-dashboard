import { Suspense } from "react"
import ScoreEntryContent from "@/components/score-entry-content"

export default function ScoreEntryPage() {
  return (
    <Suspense fallback={null}>
      <ScoreEntryContent />
    </Suspense>
  )
}
