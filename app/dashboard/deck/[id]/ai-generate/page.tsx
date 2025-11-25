"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Wand2, Dice5 } from "lucide-react"

export default function AIGeneratePage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.id as string

  const [topic, setTopic] = useState("")
  const [cardCount, setCardCount] = useState("5")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRandomTopic = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
      })
      const data = await response.json()
      if (data.topic) {
        setTopic(data.topic)
      } else {
        setError("Konnte kein zufälliges Thema generieren.")
      }
    } catch (err) {
      setError("Fehler beim Generieren eines zufälligen Themas.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!topic.trim()) {
      setError("Bitte gib ein Thema ein")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement actual AI generation
      console.log(`Generating ${cardCount} cards for topic: ${topic}`)

      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1500))

      router.push(`/dashboard/deck/${deckId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Generieren")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Karten mit KI generieren</h1>
          <div className="w-10" />
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

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

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-200">
              <p>
                🤖 KI wird {cardCount} Flashcards zum Thema "{topic || "..."}" generieren.
              </p>
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
        </div>
      </div>
    </div>
  )
}
