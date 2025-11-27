// Support custom env var for Google Gemini API key
if (!process.env.GOOGLE_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY
}
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { Flashcard } from "@/types/flashcards"

const SYSTEM_PROMPT = `Du bist ein System zur Erzeugung von Lernkarten (Flashcards).
Analysiere den Text und erstelle sinnvolle Flashcards.
Gib ausschließlich ein JSON-Array mit Objekten zurück:
[
  { "front": "...", "back": "..." },
  ...
]
Keine Kommentare, kein Text außerhalb des JSON.`

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== "string" || text.length < 10) {
      return NextResponse.json({ error: "Kein oder zu wenig Text übergeben." }, { status: 400 })
    }
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key fehlt." }, { status: 500 })
    }
    const model = google("gemini-flash-lite")
    const prompt = `${SYSTEM_PROMPT}\n\nText:\n${text}`
    const result = await generateText({
      model,
      prompt,
    })
    const raw = (result.text ?? "").trim()
    let cards: Flashcard[] = []
    try {
      cards = JSON.parse(raw)
      if (!Array.isArray(cards) || !cards.every((card) => card.front && card.back)) {
        throw new Error("Ungültiges Flashcard-Format")
      }
    } catch {
      return NextResponse.json(
        { error: "KI-Antwort konnte nicht als Flashcards geparst werden.", raw },
        { status: 500 }
      )
    }
    if (!cards.length) {
      return NextResponse.json({ error: "Keine Flashcards generiert." }, { status: 500 })
    }
    return NextResponse.json({ cards })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
