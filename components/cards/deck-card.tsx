"use client"

import { Deck } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface DeckCardProps {
  deck: Deck
  cardCount?: number
  onDelete?: (deckId: string) => void
}

export const DeckCard = ({ deck, cardCount = 0, onDelete }: DeckCardProps) => {
  return (
    <Link href={`/dashboard/deck/${deck.id}`}>
      <Card className="hover:shadow-lg transition cursor-pointer h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{deck.name}</CardTitle>
              <CardDescription className="mt-1">{cardCount} Karten</CardDescription>
            </div>
            {deck.is_public && (
              <Badge variant="secondary" className="ml-2">
                Öffentlich
              </Badge>
            )}
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
}
