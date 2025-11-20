import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { Deck } from "@/lib/types"

interface EditDeckModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deck: Deck | null
  onEditDeck: (deckId: string, name: string, description: string, isPublic: boolean) => Promise<void>
  isLoading?: boolean
}

export const EditDeckModal = ({ open, onOpenChange, deck, onEditDeck, isLoading = false }: EditDeckModalProps) => {
  const [deckName, setDeckName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (deck && open) {
      setDeckName(deck.name)
      setDescription(deck.description || "")
      setIsPublic(deck.is_public || false)
      setError("")
    }
  }, [deck, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!deckName.trim()) {
      setError("Deckname ist erforderlich")
      return
    }

    if (!deck) return

    try {
      await onEditDeck(deck.id, deckName, description, isPublic)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Bearbeiten des Decks")
    }
  }

  if (!open || !deck) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Deck bearbeiten</CardTitle>
            <CardDescription>Passe dein Deck an</CardDescription>
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
              <Label htmlFor="deckName">Deckname</Label>
              <Input
                id="deckName"
                placeholder="Deckname"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                placeholder="Beschreibung (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="isPublic" className="font-normal cursor-pointer">
                Deck öffentlich machen
              </Label>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={isLoading || !deckName.trim()} className="flex-1">
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
