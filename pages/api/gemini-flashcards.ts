import type { NextApiRequest, NextApiResponse } from "next"
import { IncomingForm, File as FormidableFile } from "formidable"
import fs from "fs"
import path from "path"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export const config = {
  api: {
    bodyParser: false,
  },
}

// PDF-Text-Extraktion für Node.js/Next.js API Route (pdfjs-dist v4)
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const uint8 = new Uint8Array(buffer)
  // Dynamically resolve the standard_fonts directory for pdfjs-dist v4+
  let standardFontDataUrl = path.resolve(require.resolve("pdfjs-dist/package.json"), "../standard_fonts/")
  standardFontDataUrl = standardFontDataUrl.replace(/\\/g, "/")
  if (!standardFontDataUrl.endsWith("/")) standardFontDataUrl += "/"
  const loadingTask = pdfjsLib.getDocument({
    data: uint8,
    standardFontDataUrl,
  })
  const pdf = await loadingTask.promise
  let fullText = ""
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Only map items that have a 'str' property (TextItem)
    const text = content.items
      .filter((item: any) => typeof item.str === "string")
      .map((item: any) => item.str)
      .join(" ")
    fullText += text + "\n"
  }
  return fullText.trim()
}

// Hilfsfunktion: Text aus Datei extrahieren
async function extractTextFromFile(filePath: string, fileName: string): Promise<string> {
  if (fileName.endsWith(".csv")) {
    return fs.readFileSync(filePath, "utf-8")
  } else if (fileName.endsWith(".pdf")) {
    const dataBuffer = fs.readFileSync(filePath)
    return await extractPdfText(dataBuffer)
  }
  return ""
}

// Hilfsfunktion: Google Gemini API aufrufen
type Flashcard = { front: string; back: string }

async function generateFlashcardsWithGemini(text: string): Promise<Flashcard[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    console.error("[Gemini] Kein API-Key gefunden!")
    throw new Error("Kein Gemini API-Key gesetzt (GOOGLE_GENERATIVE_AI_API_KEY)")
  }
  // Support custom env var for Google Gemini API key
  if (!process.env.GOOGLE_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  }
  const model = google("gemini-1.5-pro")
  const prompt = `Erstelle aus folgendem Text maximal 20 Lernkarten im JSON-Array-Format: [{\"front\":..., \"back\":...}, ...]. Antworte nur mit dem JSON-Array.\n\nText:\n${text}`
  const result = await generateText({ model, prompt })
  const raw = (result.text ?? "").trim()
  try {
    return JSON.parse(raw) as Flashcard[]
  } catch {
    return [{ front: "Fehler beim Parsen der KI-Antwort", back: raw }]
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  const form = new IncomingForm({ keepExtensions: true })
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("[Formidable] File upload error:", err)
        return res.status(500).json({ error: "File upload error" })
      }
      let file = files.file as FormidableFile | FormidableFile[] | undefined
      if (Array.isArray(file)) file = file[0]
      if (!file) return res.status(400).json({ error: "No file provided" })
      const filePath = file.filepath
      const fileName = file.originalFilename || "uploaded_file"
      const text = await extractTextFromFile(filePath, fileName)
      if (!text) return res.status(400).json({ error: "Datei konnte nicht gelesen werden" })
      const flashcards = await generateFlashcardsWithGemini(text)
      res.status(200).json({ deckName: path.basename(fileName, path.extname(fileName)), flashcards })
    } catch (error) {
      console.error("[API] Unerwarteter Fehler:", error)
      if (!res.headersSent) {
        res.status(500).json({ error: String(error) })
      }
    } finally {
      // Versuche Datei zu löschen, falls vorhanden
      try {
        let file = files.file as FormidableFile | FormidableFile[] | undefined
        if (Array.isArray(file)) file = file[0]
        if (file && file.filepath) fs.unlink(file.filepath, () => {})
      } catch {}
    }
  })
}
