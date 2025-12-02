"use client"

import { useCallback, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Deck } from "@/lib/types"

export const useDecks = (userId: string | undefined) => {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true) // Start mit true für initiales Laden
  const supabase = createClient()

  const fetchDecks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("owner", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDecks(data as Deck[])
    } catch (error) {
      console.error("Error fetching decks:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const createDeck = useCallback(
    async (name: string, description?: string, isPublic?: boolean) => {
      if (!userId) throw new Error("User not authenticated")

      try {
        const { data, error } = await supabase
          .from("decks")
          .insert([
            {
              owner: userId,
              name,
              description: description || null,
              is_public: isPublic || false,
            },
          ])
          .select()
          .single()

        if (error) throw error

        setDecks((prev) => [data as Deck, ...prev])
        return data
      } catch (error) {
        console.error("Error creating deck:", error)
        throw error
      }
    },
    [userId, supabase]
  )

  const deleteDeck = useCallback(
    async (deckId: string) => {
      try {
        const { error } = await supabase.from("decks").delete().eq("id", deckId).eq("owner", userId)

        if (error) throw error

        setDecks((prev) => prev.filter((deck) => deck.id !== deckId))
      } catch (error) {
        console.error("Error deleting deck:", error)
        throw error
      }
    },
    [userId, supabase]
  )

  const updateDeck = useCallback(
    async (deckId: string, name: string, description: string, isPublic: boolean) => {
      if (!userId) throw new Error("User not authenticated")

      try {
        const { data, error } = await supabase
          .from("decks")
          .update({
            name,
            description,
            is_public: isPublic,
          })
          .eq("id", deckId)
          .eq("owner", userId)
          .select()
          .single()

        if (error) throw error

        setDecks((prev) =>
          prev.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  name: data.name,
                  description: data.description,
                  is_public: data.is_public ?? false,
                }
              : deck
          )
        )
        return data
      } catch (error) {
        console.error("Error updating deck:", error)
        throw error
      }
    },
    [userId, supabase]
  )

  useEffect(() => {
    fetchDecks()
  }, [userId, fetchDecks])

  return {
    decks,
    loading,
    fetchDecks,
    createDeck,
    deleteDeck,
    updateDeck,
  }
}
