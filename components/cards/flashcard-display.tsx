"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/lib/types"

interface FlashcardDisplayProps {
  card: Card
  onFeedback: (status: "green" | "yellow" | "red") => void
  isLoading?: boolean
  disableFlipAnimation?: boolean
}

export const FlashcardDisplay = ({
  card,
  onFeedback,
  isLoading = false,
  disableFlipAnimation = false,
}: FlashcardDisplayProps) => {
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    setIsFlipped(false)
  }, [card?.id])

  const handleFlip = () => {
    setIsFlipped((s) => !s)
  }

  return (
    <div className="space-y-6">
      {/* Flashcard */}
      <div
        onClick={handleFlip}
        className={`relative w-full cursor-pointer grid ${
          disableFlipAnimation ? "" : "transition-transform duration-500 transform"
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionDuration: disableFlipAnimation ? "0ms" : undefined,
        }}>
        <div
          className="row-start-1 col-start-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 flex flex-col justify-center items-center text-white"
          style={{ backfaceVisibility: "hidden" }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-200 mb-4">Frage</p>
          <p className="text-2xl font-bold text-center break-words">{card.front}</p>
          <p className="text-sm text-purple-200 mt-8">Klicken zum Umdrehen</p>
        </div>

        <div
          className="row-start-1 col-start-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg p-8 flex flex-col justify-center items-center text-white"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200 mb-4">Antwort</p>
          <p className="text-2xl font-bold text-center break-words">{card.back}</p>
          <p className="text-sm text-blue-200 mt-8">Klicken zum Zurückdrehen</p>
        </div>
      </div>

      {/* Feedback Buttons */}
      {isFlipped ? (
        <div className="flex space-x-3 justify-center">
          <Button
            onClick={() => onFeedback("red")}
            disabled={isLoading}
            variant="outline"
            className="flex-1 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
            <span className="text-lg mr-2">❌</span>
            Nochmal
          </Button>
          <Button
            onClick={() => onFeedback("green")}
            disabled={isLoading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white">
            <span className="text-lg mr-2">✅</span>
            Geschafft
          </Button>
        </div>
      ) : (
        <Button onClick={handleFlip} disabled={isLoading} variant="outline" className="w-full">
          Antwort zeigen
        </Button>
      )}
    </div>
  )
}
