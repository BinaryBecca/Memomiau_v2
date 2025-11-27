import type { Flashcard } from "../../types/flashcards"

/**
 * Parst eine CSV im Format front,back zu Flashcards.
 * @param content CSV-String
 * @returns Array von Flashcards
 * @throws Error bei ungültigem CSV
 */
export function parseCsv(content: string): Flashcard[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) throw new Error("Leere CSV-Datei")
  // Header prüfen
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase())
  if (header[0] !== "front" || header[1] !== "back") {
    throw new Error("CSV muss Header 'front,back' haben")
  }
  const cards: Flashcard[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/,(.+)/) // Nur erstes Komma trennt
    if (parts.length < 3) continue
    const front = parts[1].replace(/^"|"$/g, "").trim()
    const back = parts[2].replace(/^"|"$/g, "").trim()
    if (!front && !back) continue
    cards.push({ front, back })
  }
  if (cards.length === 0) throw new Error("Keine gültigen Flashcards in der CSV gefunden")
  return cards
}
