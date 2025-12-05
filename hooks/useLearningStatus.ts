"use client"

import { useCallback, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Database } from "@/database.types"
import { CardLearningStatus } from "@/lib/types"

export const useLearningStatus = (userId: string | undefined) => {
  const [statuses, setStatuses] = useState<CardLearningStatus[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    }
  )

  const fetchStatuses = useCallback(
    async (cardIds?: string[]) => {
      if (!userId) return
      setLoading(true)
      try {
        let query = supabase.from("card_learning_status").select("*").eq("user_id", userId)

        if (cardIds && cardIds.length > 0) {
          query = query.in("card_id", cardIds)
        }

        const { data, error } = await query

        if (error) throw error
        setStatuses(data as CardLearningStatus[])
      } catch (error) {
        console.error("Error fetching learning status:", error)
      } finally {
        setLoading(false)
      }
    },
    [userId, supabase]
  )

  const updateStatus = async (cardId: string, status: "green" | "yellow" | "red") => {
    if (!userId) throw new Error("User not authenticated")

    try {
      const { data: existing } = await supabase
        .from("card_learning_status")
        .select("*")
        .eq("card_id", cardId)
        .eq("user_id", userId)
        .single()

      let result
      if (existing) {
        const { data, error } = await supabase
          .from("card_learning_status")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from("card_learning_status")
          .insert([
            {
              card_id: cardId,
              user_id: userId,
              status,
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      setStatuses((prev) => {
        const filtered = prev.filter((s) => s.card_id !== cardId)
        return [...filtered, result as CardLearningStatus]
      })

      return result
    } catch (error) {
      throw error
    }
  }

  const getStatusByCard = (cardId: string) => {
    return statuses.find((s) => s.card_id === cardId)
  }

  const getCardsByStatus = (status: "green" | "yellow" | "red") => {
    return statuses.filter((s) => s.status === status).map((s) => s.card_id)
  }

  return {
    statuses,
    loading,
    fetchStatuses,
    updateStatus,
    getStatusByCard,
    getCardsByStatus,
  }
}
