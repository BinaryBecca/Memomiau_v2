import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface CreateDeckModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateDeck: (name: string, isPublic: boolean) => Promise<void>
  onAIGenerate?: (name: string) => void
  isLoading?: boolean
}

export const CreateDeckModal = ({
  open,
  onOpenChange,
  onCreateDeck,
  onAIGenerate,
  isLoading = false,
}: CreateDeckModalProps) => {
  const [deckName, setDeckName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!deckName.trim()) {
      setError("Deck name is required")
      return
    }

    try {
      await onCreateDeck(deckName, isPublic)
      setDeckName("")
      setIsPublic(false)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck")
    }
  }

  const handleAIGenerate = () => {
    if (!deckName.trim()) {
      setError("Deck name is required")
      return
    }

    onAIGenerate?.(deckName)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Neues Deck</CardTitle>
            <CardDescription>Erstelle ein neues Deck zum Lernen</CardDescription>
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
                {isLoading ? "Wird erstellt..." : "Neues Deck erstellen"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !deckName.trim()}
                onClick={handleAIGenerate}
                className="flex-1">
                {isLoading ? "Wird generiert..." : "Mit KI erstellen"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
