"use client"

import { useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Deck } from "@/lib/types"

export const useCommunityDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchPublicDecks = useCallback(
    async (searchQuery?: string) => {
      setLoading(true)
      try {
        let query = supabase.from("decks").select("*, profiles(username)").eq("is_public", true).order("created_at", { ascending: false })

        if (searchQuery && searchQuery.trim()) {
          query = query.ilike("name", `%${searchQuery}%`)
        }

        const { data, error } = await query

        if (error) throw error
        setDecks(data as Deck[])
      } catch (error) {
        console.error("Error fetching public decks:", error)
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const addDeckToCollection = async (userId: string, deckId: string) => {
    try {
      // Create a copy of the deck for the user
      const deckToCopy = decks.find((d) => d.id === deckId)
      if (!deckToCopy) throw new Error("Deck not found")

      const { data, error } = await supabase
        .from("decks")
        .insert([
          {
            owner: userId,
            name: `${deckToCopy.name} (Kopie)`,
            description: deckToCopy.description,
            is_public: false,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  }

  return {
    decks,
    loading,
    fetchPublicDecks,
    addDeckToCollection,
  }
}
