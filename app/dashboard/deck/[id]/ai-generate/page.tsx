"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Wand2, Dice5 } from "lucide-react"

export default function AIGeneratePage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.id as string

  const [topic, setTopic] = useState("")
  const [cardCount, setCardCount] = useState("5")
  const [isLoading, setIsLoading] = useState(false)
  const [flashcards, setFlashcards] = useState<Array<{ front: string; back: string }>>([])
  const [saveLoading, setSaveLoading] = useState(false)

  const handleRandomTopic = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
      })
      const data = await response.json()
      if (data.topic) {
        setTopic(data.topic)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic.trim()) {
      return
    }

    setIsLoading(true)
    setFlashcards([])
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, cardCount: Number(cardCount) }),
      })
      const data = await response.json()
      if (data.cards && Array.isArray(data.cards)) {
        setFlashcards(data.cards)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-200 mb-6">
          <p>
            🤖 KI wird {cardCount} Flashcards zum Thema &quot;{topic || "..."}&quot; generieren.
          </p>
        </div>

        {/* Eingabeformular */}
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Thema oder Prompt</Label>
            <div className="flex space-x-2">
              <textarea
                id="topic"
                placeholder="Beschreibe dein Thema oder gib mehrere Sätze als Prompt ein..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRandomTopic}
                disabled={isLoading}
                title="Zufälliges Thema">
                <Dice5 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Card Count */}
          <div className="space-y-2">
            <Label htmlFor="cardCount">Anzahl Karten</Label>
            <input
              id="cardCount"
              type="number"
              min={1}
              max={500}
              value={cardCount}
              onChange={(e) => {
                const val = Math.max(1, Math.min(500, Number(e.target.value)))
                setCardCount(val.toString())
              }}
              disabled={isLoading}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Anzahl zwischen 1 und 500"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4 border-t dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="flex-1 flex items-center justify-center space-x-2">
              <Wand2 className="w-4 h-4" />
              <span>{isLoading ? "Wird generiert..." : "Generieren"}</span>
            </Button>
          </div>
        </form>

        {/* Flashcards Vorschau und Speichern-Button */}
        {flashcards.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Generierte Flashcards</h2>
            <ul className="space-y-4">
              {flashcards.map((card, idx) => (
                <li key={idx} className="p-4 rounded-lg border bg-gray-50 dark:bg-slate-800">
                  <div className="font-bold mb-1">Frage:</div>
                  <div className="mb-2">{card.front}</div>
                  <div className="font-bold mb-1">Antwort:</div>
                  <div>{card.back}</div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={async () => {
                  setSaveLoading(true)
                  // TODO: Hier Backend-Speicherlogik einfügen
                  alert("Karten werden speichern (Demo)")
                  setSaveLoading(false)
                  router.push(`/dashboard/deck/${deckId}`)
                }}
                disabled={saveLoading}
                className="px-6 py-2 font-semibold">
                {saveLoading ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
