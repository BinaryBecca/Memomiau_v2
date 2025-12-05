"use client"

import { useParams } from "next/navigation"
import { useCards } from "@/hooks/useCards"
import { CardForm } from "@/components/cards/card-form"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function NewCardPage() {
  const params = useParams()
  const deckId = params.id as string
  const { createCard } = useCards(deckId, undefined)
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

  return (
    <div>
      <div className="mb-6">
        <Link href={`/dashboard/deck/${deckId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Deck
        </Link>
      </div>

      <CardForm deckId={deckId} onSave={handleSaveCard} isLoading={isLoading} />
    </div>
  )
}
