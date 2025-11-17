"use client"

import { useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/lib/types"

export const useCards = (deckId: string | undefined) => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchCards = useCallback(async () => {
    if (!deckId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCards(data as Card[])
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
  }, [deckId, supabase])

  const createCard = async (front: string, back: string, imageUrl?: string) => {
    if (!deckId) throw new Error("Deck not found")

    try {
      const { data, error } = await supabase
        .from("cards")
        .insert([
          {
            deck_id: deckId,
            front,
            back,
            image_url: imageUrl || null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setCards((prev) => [data as Card, ...prev])
      return data
    } catch (error) {
      throw error
    }
  }

  const updateCard = async (cardId: string, updates: Partial<Pick<Card, "front" | "back" | "image_url">>) => {
    try {
      const { data, error } = await supabase.from("cards").update(updates).eq("id", cardId).select().single()

      if (error) throw error

      setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, ...updates } : card)))
      return data
    } catch (error) {
      throw error
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase.from("cards").delete().eq("id", cardId)

      if (error) throw error

      setCards((prev) => prev.filter((card) => card.id !== cardId))
    } catch (error) {
      throw error
    }
  }

  return {
    cards,
    loading,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
  }
}
