"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useDecks } from "@/hooks/useDecks"
import { useCards } from "@/hooks/useCards"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Wand2, BookOpen, Trash2, Edit2 } from "lucide-react"
import { EditCardModal } from "@/components/modals/edit-card-modal"
import { Card as CardType } from "@/lib/types"
import Link from "next/link"

export default function DeckDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const deckId = params.id as string

  const { decks } = useDecks(user?.id)
  const { cards, loading: cardsLoading, fetchCards, deleteCard, updateCard } = useCards(deckId)

  const [deck, setDeck] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)

  useEffect(() => {
    const currentDeck = decks.find((d) => d.id === deckId)
    if (currentDeck) {
      setDeck(currentDeck)
      setLoading(false)
    }
  }, [decks, deckId])

  useEffect(() => {
    if (deckId) {
      fetchCards()
    }
  }, [deckId, fetchCards])

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Möchtest du diese Karte wirklich löschen?")) {
      return
    }

    try {
      setDeletingCardId(cardId)
      await deleteCard(cardId)
    } catch (error) {
      console.error("Error deleting card:", error)
      alert("Fehler beim Löschen der Karte")
    } finally {
      setDeletingCardId(null)
    }
  }

  const handleEditCard = (card: CardType) => {
    setSelectedCard(card)
    setEditModalOpen(true)
  }

  const handleUpdateCard = async (cardId: string, front: string, back: string) => {
    try {
      await updateCard(cardId, { front, back })
      setEditModalOpen(false)
    } catch (error) {
      console.error("Error updating card:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐱</div>
          <p className="text-gray-600 dark:text-gray-400">Lädt Deck...</p>
        </div>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Deck nicht gefunden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{deck.name}</h1>
            {deck.description && <p className="text-gray-600 dark:text-gray-400 mt-1">{deck.description}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-8 border dark:border-slate-800">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{cards.length} Karten im Deck</p>
        </div>

        {/* Content */}
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dieses Deck hat noch keine Karten</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Beginne mit dem Hinzufügen von Flashcards</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
              <Button asChild>
                <Link href={`/dashboard/deck/${deckId}/cards/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Karten hinzufügen
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/deck/${deckId}/ai-generate`}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Mit KI generieren
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button asChild className="flex-1">
                <Link href={`/dashboard/deck/${deckId}/learn`}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Karten lernen
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/dashboard/deck/${deckId}/cards/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Karten hinzufügen
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/dashboard/deck/${deckId}/ai-generate`}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Mit KI generieren
                </Link>
              </Button>
            </div>

            {/* Cards List */}
            {cardsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-2">🐱</div>
                <p className="text-gray-600 dark:text-gray-400">Lädt Karten...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white dark:bg-slate-900 rounded-lg p-4 border dark:border-slate-800 hover:shadow-md transition flex justify-between items-start group">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{card.front}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.back}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCard(card)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCard(card.id)}
                        disabled={deletingCardId === card.id}
                        className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Card Modal */}
      <EditCardModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        card={selectedCard}
        onEditCard={handleUpdateCard}
      />
    </div>
  )
}
