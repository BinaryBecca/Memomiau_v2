"use client"

import { useState, memo, useCallback } from "react"
import { Deck } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"
import Link from "next/link"
import { useNotification } from "@/components/ui/notification"
import { useConfirm } from "@/components/ui/confirm"

interface DeckCardProps {
  deck: Deck
  cardCount?: number
  onDelete?: (deckId: string) => Promise<void>
  onEdit?: (deck: Deck) => void
}

export const DeckCard = memo(({ deck, cardCount = 0, onDelete, onEdit }: DeckCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { notify } = useNotification()
  const { confirm } = useConfirm()

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!onDelete) return

      const ok = await confirm({
        title: "Deck löschen?",
        description: `Möchtest du das Deck "${deck.name}" wirklich löschen? Dies kann nicht rückgängig gemacht werden.`,
      })
      if (!ok) return

      try {
        setIsDeleting(true)
        await onDelete(deck.id)
      } catch (error) {
        console.error("Error deleting deck:", error)
        notify("Fehler beim Löschen des Decks")
      } finally {
        setIsDeleting(false)
      }
    },
    [onDelete, deck.name, deck.id, confirm, notify]
  )

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onEdit?.(deck)
    },
    [onEdit, deck]
  )

  return (
    <Link href={`/dashboard/deck/${deck.id}`}>
      <Card className="hover:shadow-lg transition cursor-pointer h-full group relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg heading font-extrabold">{deck.name}</CardTitle>
              <CardDescription className="mt-1">{cardCount} Karten</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {deck.is_public && (
                <Badge variant="secondary" className="ml-2">
                  Öffentlich
                </Badge>
              )}
              <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    className="h-7 w-7 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-7 w-7 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {deck.description && <p className="text-sm text-gray-600 dark:text-gray-400">{deck.description}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            Erstellt: {new Date(deck.created_at).toLocaleDateString("de-DE")}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
})
