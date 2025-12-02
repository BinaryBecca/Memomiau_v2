"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useCards } from "@/hooks/useCards"
import { useLearningStatus } from "@/hooks/useLearningStatus"
import { FlashcardDisplay } from "@/components/cards/flashcard-display"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { Card } from "@/lib/types"
import LoadingCat from "@/components/cat-loader"

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const deckId = params.id as string
  const searchParams = useSearchParams()

  const { cards, loading: cardsLoading, fetchCards } = useCards(deckId, user?.id)
  const { updateStatus } = useLearningStatus(user?.id)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsToLearn, setCardsToLearn] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [progress, setProgress] = useState({ green: 0, yellow: 0, red: 0 })
  // ...existing code...
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    if (deckId) {
      fetchCards()
    }
  }, [deckId, fetchCards])

  useEffect(() => {
    if (cards.length > 0) {
      let filteredCards = cards

      // Filter by status
      const statusesParam = searchParams.getAll("status")
      if (statusesParam.length > 0) {
        filteredCards = cards.filter((card) => statusesParam.includes(card.learning_status || ""))
      }

      // Limit cards
      const limitParam = searchParams.get("limit")
      if (limitParam) {
        const limit = parseInt(limitParam, 10)
        if (!isNaN(limit) && limit > 0) {
          filteredCards = filteredCards.slice(0, limit)
        }
      }

      // Shuffle cards if random param is set
      const randomParam = searchParams.get("random")
      if (randomParam === "true") {
        // Fisher-Yates Shuffle
        for (let i = filteredCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]]
        }
      }

      setCardsToLearn(filteredCards)
      setLoading(false)
    }
  }, [cards, searchParams])

  useEffect(() => {
    const timerParam = searchParams.get("timer")
    if (timerParam) {
      const minutes = parseInt(timerParam, 10)
      if (!isNaN(minutes) && minutes > 0) {
        setTimeLeft(minutes * 60)
        setTimerActive(true)
      }
    }
  }, [searchParams])

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || timeLeft === null || timeLeft <= 0) {
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null))
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  // Effect to handle timer end
  useEffect(() => {
    if (timeLeft === 0) {
      router.push(`/dashboard/deck/${deckId}`)
    }
  }, [timeLeft, router, deckId])

  const handleFeedback = async (status: "green" | "yellow" | "red") => {
    if (currentIndex >= cardsToLearn.length) return

    setIsUpdating(true)
    try {
      const currentCard = cardsToLearn[currentIndex]
      // Nur 'green' und 'red' zulassen
      if (status === "green" || status === "red") {
        await updateStatus(currentCard.id, status)
        setProgress((prev) => ({
          ...prev,
          [status]: prev[status] + 1,
        }))
      }

      // Move to next card
      if (currentIndex + 1 < cardsToLearn.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Learning session completed
        setTimeout(() => {
          router.push(`/dashboard/deck/${deckId}`)
        }, 1000)
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setProgress({ green: 0, yellow: 0, red: 0 })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading || cardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingCat />
      </div>
    )
  }

  if (cardsToLearn.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Keine Karten zum Lernen</p>
        </div>
      </div>
    )
  }

  const currentCard = cardsToLearn[currentIndex]
  const progressPercent = ((currentIndex + 1) / cardsToLearn.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lernen</h1>
          {timerActive && timeLeft !== null && (
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">⏰ {formatTime(timeLeft)}</div>
          )}
          {!timerActive && <div className="w-10" />}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Fortschritt: {currentIndex + 1} / {cardsToLearn.length}
            </p>
            <div className="flex space-x-4 text-sm">
              <span className="text-green-600 dark:text-green-400">✅ {progress.green}</span>
              <span className="text-red-600 dark:text-red-400">❌ {progress.red}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <FlashcardDisplay card={currentCard} onFeedback={handleFeedback} isLoading={isUpdating} />

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8 justify-center">
          <Button onClick={handleReset} variant="outline" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Zurücksetzen</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
