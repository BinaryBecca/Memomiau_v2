"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Wand2, Dice5, Trash2, Edit2, ArrowLeft } from "lucide-react"
import { EditCardModal } from "@/components/modals/edit-card-modal"
import { useCards } from "@/hooks/useCards"
import { useNotification } from "@/components/ui/notification"

export default function AIGeneratePage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.id as string

  const { createCard } = useCards(deckId, undefined)

  const [topic, setTopic] = useState("")
  const [cardCount, setCardCount] = useState("5")
  const [isLoading, setIsLoading] = useState(false)
  const [flashcards, setFlashcards] = useState<Array<{ front: string; back: string }>>([])
  const [saveLoading, setSaveLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null)
  const { notify } = useNotification()

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Zurück-Pfeil und Titel */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KI-Flashcards generieren</h1>
          <div className="w-10" />
        </div>

        {/* Haupt-Formular und Vorschau im weißen Container */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6 mb-8">
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
              <Button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="flex-1 flex items-center justify-center space-x-2"
                variant="pink">
                <Wand2 className="w-4 h-4" />
                <span>{isLoading ? "Wird generiert..." : "Generieren"}</span>
              </Button>
            </div>
          </form>

          {/* Info unter Button Generieren, aber über Flashcards */}
          {flashcards.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-200 mb-6 mt-6">
              <p>
                🤖 KI wird {cardCount} Flashcards zum Thema &quot;{topic || "..."}&quot; generieren.
              </p>
            </div>
          )}

          {/* Flashcards Vorschau und Speichern-Button */}
          {flashcards.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Generierte Flashcards</h2>
              <ul className="space-y-4">
                {flashcards.map((card, idx) => (
                  <li
                    key={idx}
                    className="rounded p-4 min-h-20 flex flex-col bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-700">
                    <div className="font-bold mb-1">Frage:</div>
                    <div className="mb-2">{card.front}</div>
                    <div className="font-bold mb-1">Antwort:</div>
                    <div>{card.back}</div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full mr-2"
                        onClick={() => {
                          setSelectedCardIdx(idx)
                          setEditModalOpen(true)
                        }}
                        title="Bearbeiten">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setFlashcards((prev) => prev.filter((_, i) => i !== idx))}
                        title="Löschen">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Modal für Bearbeiten einer Flashcard */}
              <EditCardModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                card={
                  selectedCardIdx !== null
                    ? {
                        id: String(selectedCardIdx),
                        front: flashcards[selectedCardIdx].front,
                        back: flashcards[selectedCardIdx].back,
                        deck_id: deckId,
                        image_url: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      }
                    : null
                }
                onEditCard={async (_id, front, back) => {
                  if (selectedCardIdx !== null) {
                    setFlashcards((prev) => prev.map((c, i) => (i === selectedCardIdx ? { front, back } : c)))
                  }
                }}
                isLoading={false}
              />
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  onClick={async () => {
                    setSaveLoading(true)
                    try {
                      for (const card of flashcards) {
                        await createCard(card.front, card.back)
                      }
                      router.push(`/dashboard/deck/${deckId}`)
                    } catch {
                      notify("Fehler beim Speichern der Karten")
                    } finally {
                      setSaveLoading(false)
                    }
                  }}
                  disabled={saveLoading}
                  className="px-6 py-2 font-semibold ml-4"
                  variant="pink">
                  {saveLoading ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
