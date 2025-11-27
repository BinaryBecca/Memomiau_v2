"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Trash2, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { EditCardModal } from "@/components/modals/edit-card-modal"

interface CardFormProps {
  deckId: string
  onSave: (front: string, back: string) => Promise<void>
  isLoading?: boolean
}

export const CardForm = ({ deckId, onSave, isLoading = false }: CardFormProps) => {
  const router = useRouter()
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [error, setError] = useState("")
  const [cards, setCards] = useState<Array<{ front: string; back: string }>>([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!front.trim() || !back.trim()) {
      setError("Vorder- und Rückseite sind erforderlich")
      return
    }
    setCards((prev) => [...prev, { front, back }])
    setFront("")
    setBack("")
  }

  const handleSaveAll = async () => {
    setSaveLoading(true)
    try {
      for (const card of cards) {
        await onSave(card.front, card.back)
      }
      router.push(`/dashboard/deck/${deckId}`)
    } catch {
      setError("Fehler beim Speichern der Karten")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Neue Karte</h1>
          <div className="w-10" />
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateCard} className="space-y-6">
            {/* Front */}
            <div className="space-y-2">
              <Label htmlFor="front">Vorderseite</Label>
              <Textarea
                id="front"
                placeholder="Frage oder Konzept..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                disabled={isLoading}
                className="min-h-[120px]"
              />
            </div>

            {/* Back */}
            <div className="space-y-2">
              <Label htmlFor="back">Rückseite</Label>
              <Textarea
                id="back"
                placeholder="Antwort oder Erklärung..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                disabled={isLoading}
                className="min-h-[120px]"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t dark:border-slate-700">
              <div className="flex-1" />
              <Button type="submit" disabled={isLoading || !front.trim() || !back.trim()}>
                Erstellen
              </Button>
            </div>
          </form>

          {/* Aufgelistete Flashcards */}
          {cards.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Erstellte Flashcards</h2>
              <ul className="space-y-4">
                {cards.map((card, idx) => (
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
                        onClick={() => setCards((prev) => prev.filter((_, i) => i !== idx))}
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
                        front: cards[selectedCardIdx].front,
                        back: cards[selectedCardIdx].back,
                        deck_id: deckId,
                        image_url: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      }
                    : null
                }
                onEditCard={async (_id, front, back) => {
                  if (selectedCardIdx !== null) {
                    setCards((prev) => prev.map((c, i) => (i === selectedCardIdx ? { front, back } : c)))
                  }
                }}
                isLoading={false}
              />
              {/* Speichern Button */}
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={saveLoading}
                  className="px-6 py-2 font-semibold ml-4">
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
