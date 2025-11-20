import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { Card as CardType } from "@/lib/types"

interface EditCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CardType | null
  onEditCard: (cardId: string, front: string, back: string) => Promise<void>
  isLoading?: boolean
}

export const EditCardModal = ({ open, onOpenChange, card, onEditCard, isLoading = false }: EditCardModalProps) => {
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (card && open) {
      setFront(card.front)
      setBack(card.back)
      setError("")
    }
  }, [card, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!front.trim() || !back.trim()) {
      setError("Vorder- und Rückseite sind erforderlich")
      return
    }

    if (!card) return

    try {
      await onEditCard(card.id, front, back)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Bearbeiten der Karte")
    }
  }

  if (!open || !card) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Karte bearbeiten</CardTitle>
            <CardDescription>Passe deine Flashcard an</CardDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="front">Vorderseite</Label>
              <Textarea
                id="front"
                placeholder="Frage oder Konzept..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                disabled={isLoading}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="back">Rückseite</Label>
              <Textarea
                id="back"
                placeholder="Antwort oder Erklärung..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                disabled={isLoading}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={isLoading || !front.trim() || !back.trim()} className="flex-1">
                {isLoading ? "Wird aktualisiert..." : "Speichern"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
                className="flex-1">
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
