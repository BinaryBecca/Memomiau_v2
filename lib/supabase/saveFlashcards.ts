import { createClient } from "@supabase/supabase-js"
import type { Flashcard } from "@/types/flashcards"

// Optional: Hole URL und Key aus Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Speichert Flashcards in Supabase (Tabelle: flashcards)
 * @param deckId Deck-ID
 * @param cards Array von Flashcards
 */
export async function saveFlashcards(deckId: string, cards: Flashcard[]): Promise<void> {
  if (!deckId || !cards.length) throw new Error("DeckId und Karten erforderlich")
  const inserts = cards.map((card) => ({
    front: card.front,
    back: card.back,
    deck_id: deckId,
  }))
  const { error } = await supabase.from("flashcards").insert(inserts)
  if (error) throw new Error("Fehler beim Speichern der Flashcards: " + error.message)
}
