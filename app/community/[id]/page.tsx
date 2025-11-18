"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useCards } from "@/hooks/useCards"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Deck } from "@/lib/types"

export default function CommunityDeckDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const deckId = params.id as string
  const supabase = createClient()

  const { cards, loading: cardsLoading, fetchCards } = useCards(deckId)

  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingDeck, setIsAddingDeck] = useState(false)

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const { data, error } = await supabase
          .from("decks")
          .select("*")
          .eq("id", deckId)
          .eq("is_public", true)
          .single()

        if (error) throw error
        setDeck(data as Deck)
      } catch (error) {
        console.error("Error fetching deck:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeck()
  }, [deckId, supabase])

  useEffect(() => {
    if (deckId) {
      fetchCards()
    }
  }, [deckId, fetchCards])

  const handleAddDeck = async () => {
    if (!user?.id || !deck) return

    setIsAddingDeck(true)
    try {
      // Copy the public deck to user's collection
      const { data, error } = await supabase
        .from("decks")
        .insert([
          {
            owner: user.id,
            name: deck.name,
            description: deck.description,
            is_public: false,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Copy all cards from public deck to new deck
      if (cards.length > 0) {
        const newCards = cards.map((card) => ({
          deck_id: data.id,
          front: card.front,
          back: card.back,
          image_url: card.image_url,
        }))

        const { error: cardsError } = await supabase.from("cards").insert(newCards)

        if (cardsError) throw cardsError
      }

      alert("Deck zu deiner Sammlung hinzugefügt!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error adding deck:", error)
      alert("Fehler beim Hinzufügen des Decks")
    } finally {
      setIsAddingDeck(false)
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

        {/* Add to Collection Button */}
        {user ? (
          <Button
            onClick={handleAddDeck}
            disabled={isAddingDeck}
            className="mb-8"
            size="lg">
            <Download className="w-4 h-4 mr-2" />
            {isAddingDeck ? "Wird hinzugefügt..." : "Zu meiner Sammlung hinzufügen"}
          </Button>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-blue-900 dark:text-blue-100">
              <a href="/auth/login" className="font-semibold hover:underline">
                Melde dich an
              </a>
              , um dieses Deck zu deiner Sammlung hinzuzufügen
            </p>
          </div>
        )}

        {/* Content */}
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dieses Deck hat noch keine Karten</h2>
          </div>
        ) : (
          <div className="space-y-2">
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
                    className="bg-white dark:bg-slate-900 rounded-lg p-4 border dark:border-slate-800 hover:shadow-md transition">
                    <p className="font-semibold text-gray-900 dark:text-white">{card.front}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.back}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
