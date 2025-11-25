"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useDecks } from "@/hooks/useDecks"
import { Button } from "@/components/ui/button"
import { CreateDeckModal } from "@/components/modals/create-deck-modal"
import { EditDeckModal } from "@/components/modals/edit-deck-modal"
import { DeckCard } from "@/components/cards/deck-card"
import { Plus, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Deck } from "@/lib/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const { decks, loading, createDeck, deleteDeck, updateDeck } = useDecks(user?.id)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  // Decks und Kartenanzahlen laden
  useEffect(() => {
    if (!user?.id || decks.length === 0) return

    const fetchCounts = async () => {
      const counts: Record<string, number> = {}

      for (const deck of decks) {
        const { count, error } = await supabase.from("cards").select("*", { count: "exact" }).eq("deck_id", deck.id)

        if (!error) counts[deck.id] = count || 0
      }

      setCardCounts(counts)
    }

    fetchCounts()
  }, [user?.id, decks, supabase])

  const handleCreateDeck = async (name: string, description: string, isPublic: boolean) => {
    if (!user?.id) {
      console.warn("User not authenticated yet")
      return
    }

    try {
      const newDeck = await createDeck(name, description, isPublic)
      if (newDeck) setCardCounts((prev) => ({ ...prev, [newDeck.id]: 0 }))
    } catch (error) {
      console.error("Error creating deck:", error)
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDeck(deckId)
      setCardCounts((prev) => {
        const newCounts = { ...prev }
        delete newCounts[deckId]
        return newCounts
      })
    } catch (error) {
      console.error("Error deleting deck:", error)
    }
  }

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setEditModalOpen(true)
  }

  const handleUpdateDeck = async (deckId: string, name: string, description: string, isPublic: boolean) => {
    try {
      await updateDeck(deckId, name, description, isPublic)
      setEditModalOpen(false)
    } catch (error) {
      console.error("Error updating deck:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meine Decks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{decks.length} Decks insgesamt</p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importieren</span>
            </Button>
            <Button onClick={() => setModalOpen(true)} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Erstellen</span>
            </Button>
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🐱</div>
              <p className="text-gray-600 dark:text-gray-400">Lädt Decks...</p>
            </div>
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Noch keine Decks</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Erstelle dein erstes Deck, um mit dem Lernen zu beginnen
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Neues Deck erstellen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                cardCount={cardCounts[deck.id] || 0}
                onDelete={handleDeleteDeck}
                onEdit={handleEditDeck}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Deck Modal */}
      <CreateDeckModal open={modalOpen} onOpenChange={setModalOpen} onCreateDeck={handleCreateDeck} />

      {/* Edit Deck Modal */}
      <EditDeckModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        deck={selectedDeck}
        onEditDeck={handleUpdateDeck}
      />
    </div>
  )
}
