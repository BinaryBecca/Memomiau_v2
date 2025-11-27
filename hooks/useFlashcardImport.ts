import { useState } from "react"
import { extractPdfText } from "@/lib/pdf/extractPdfText"
import { parseCsv } from "@/lib/csv/parseCsv"
import type { Flashcard } from "@/types/flashcards"

export function useFlashcardImport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<Flashcard[] | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)

  async function importFromFile(file: File) {
    setLoading(true)
    setError(null)
    setCards(null)
    setImportFile(file)
    try {
      let text = ""
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        text = await file.text()
        setCards(parseCsv(text))
        setLoading(false)
        return
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const buffer = await file.arrayBuffer()
        text = await extractPdfText(Buffer.from(buffer))
      } else {
        throw new Error("Nur PDF oder CSV werden unterstützt.")
      }
      // Text an KI-API schicken
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unbekannter Fehler bei der KI-Generierung")
      setCards(data.cards)
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, cards, importFile, importFromFile }
}
