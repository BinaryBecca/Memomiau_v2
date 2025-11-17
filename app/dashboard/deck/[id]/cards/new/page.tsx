"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useCards } from "@/hooks/useCards"
import { CardForm } from "@/components/cards/card-form"
import { useState } from "react"

export default function NewCardPage() {
  const params = useParams()
  const { user } = useAuth()
  const deckId = params.id as string
  const { createCard } = useCards(deckId)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveCard = async (front: string, back: string) => {
    setIsLoading(true)
    try {
      await createCard(front, back)
    } catch (error) {
      console.error("Error creating card:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return <CardForm deckId={deckId} onSave={handleSaveCard} isLoading={isLoading} />
}
