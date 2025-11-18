"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Eye, Wand2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CardFormProps {
  deckId: string
  onSave: (front: string, back: string) => Promise<void>
  isLoading?: boolean
}

export const CardForm = ({ deckId, onSave, isLoading = false }: CardFormProps) => {
  const router = useRouter()
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!front.trim() || !back.trim()) {
      setError("Vorder- und Rückseite sind erforderlich")
      return
    }

    try {
      await onSave(front, back)
      setFront("")
      setBack("")
      router.push(`/dashboard/deck/${deckId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Neue Karte</h1>
          <div className="w-10" />
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Front */}
            <div className="space-y-2">
              <Label htmlFor="front">Vorderseite</Label>
              <Textarea
                id="front"
                placeholder="Frage oder Konzept..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                disabled={isLoading}
                className="min-h-[120px]"
              />
            </div>

            {/* Back */}
            <div className="space-y-2">
              <Label htmlFor="back">Rückseite</Label>
              <Textarea
                id="back"
                placeholder="Antwort oder Erklärung..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                disabled={isLoading}
                className="min-h-[120px]"
              />
            </div>

            {/* Preview */}
            {showPreview && (front || back) && (
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Vorschau - Vorderseite
                  </p>
                  <div className="bg-white dark:bg-slate-700 rounded p-4 min-h-20 flex items-center">
                    <p className="text-gray-900 dark:text-white">{front || "(leer)"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Vorschau - Rückseite
                  </p>
                  <div className="bg-white dark:bg-slate-700 rounded p-4 min-h-20 flex items-center">
                    <p className="text-gray-900 dark:text-white">{back || "(leer)"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{showPreview ? "Vorschau aus" : "Vorschau"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !front.trim()}
                className="flex items-center justify-center space-x-2">
                <Wand2 className="w-4 h-4" />
                <span>Mit KI verbessern</span>
              </Button>

              <div className="flex-1" />

              <Button type="submit" disabled={isLoading || !front.trim() || !back.trim()}>
                {isLoading ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
