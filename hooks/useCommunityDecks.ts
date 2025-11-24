"use client"

import { useCallback, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Deck } from "@/lib/types"

export const useCommunityDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // ...existing code...

  const fetchPublicDecks = useCallback(
    async (searchQuery?: string) => {
      setLoading(true)
      try {
        let query = supabase
          .from("decks")
          .select("*, profiles(username), cards(count)")
          .eq("is_public", true)
          .order("created_at", { ascending: false })

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

  // Supabase Realtime Listener für öffentliche Decks
  // Aktualisiert die Decks automatisch bei Änderungen
  useEffect(() => {
    const channel = supabase
      .channel('public-decks')
      .on(
        'postgres_changes',
        {
          event: '*', // insert, update, delete
          schema: 'public',
          table: 'decks',
          filter: 'is_public=eq.true'
        },
        () => {
          fetchPublicDecks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPublicDecks, supabase])

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
