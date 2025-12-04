"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useCommunityDecks } from "@/hooks/useCommunityDecks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Wand2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import LoadingCat from "@/components/cat-loader"
import { useNotification } from "@/components/ui/notification"

export default function CommunityPage() {
  const { user } = useAuth()
  const { decks, loading, fetchPublicDecks, addDeckToCollection } = useCommunityDecks()
  const { notify } = useNotification()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingDeck, setIsAddingDeck] = useState<string | null>(null)
  const [showLoader, setShowLoader] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchPublicDecks()
  }, [fetchPublicDecks])

  // Loader für mindestens 3 Sekunden anzeigen
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowLoader(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setShowLoader(true)
    }
  }, [loading])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchPublicDecks(query)
  }

  const handleAddDeck = async (deckId: string) => {
    if (!user?.id) return

    setIsAddingDeck(deckId)
    try {
      // Find the deck data from the current decks list
      const deck = decks.find((d) => d.id === deckId)
      if (!deck) throw new Error("Deck not found")

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

      // Fetch cards directly from database
      const { data: cardsData, error: fetchError } = await supabase.from("cards").select("*").eq("deck_id", deckId)

      if (fetchError) throw fetchError

      // Copy all cards from public deck to new deck
      if (cardsData && cardsData.length > 0) {
        const newCards = cardsData.map((card) => ({
          deck_id: data.id,
          front: card.front,
          back: card.back,
          image_url: card.image_url || null,
        }))

        const { error: cardsError } = await supabase.from("cards").insert(newCards)

        if (cardsError) throw cardsError
      }

      // Redirect to dashboard after successful addition
      router.push("/dashboard")
    } catch (error) {
      console.error("Error adding deck:", error)
      notify("Fehler beim Hinzufügen des Decks")
    } finally {
      setIsAddingDeck(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community Decks</h1>
          <p className="text-gray-600 dark:text-gray-400">Entdecke und lerne von öffentlichen Decks der Community</p>
        </div>

        {/* Search */}
        <div className="mb-8 flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Decks suchen..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Decks Grid */}
        {showLoader ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingCat />
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Keine Decks gefunden</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Versuche eine andere Suchanfrage oder erstelle dein eigenes Deck
            </p>
            {user && (
              <Button asChild>
                <Link href="/dashboard">Zum Dashboard</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/community/${deck.id}`}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{deck.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Von: {deck.profiles?.username ?? "Unbekannt"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Öffentlich</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deck.description && <p className="text-sm text-gray-600 dark:text-gray-400">{deck.description}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {typeof deck.cards?.[0]?.count === "number" ? `${deck.cards[0].count} Karten` : "0 Karten"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Erstellt: {new Date(deck.created_at).toLocaleDateString("de-DE")}
                    </p>

                    {user ? (
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddDeck(deck.id)
                        }}
                        disabled={isAddingDeck === deck.id}
                        className="w-full"
                        size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        {isAddingDeck === deck.id ? "Wird hinzugefügt..." : "Hinzufügen"}
                      </Button>
                    ) : (
                      <Button asChild className="w-full" size="sm" variant="outline">
                        <Link href="/auth/login">Anmelden zum Hinzufügen</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
