import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
// pdf-parse will be imported dynamically in the handler
import csvParser from "csv-parser"
import type { NextApiRequest, NextApiResponse } from "next"
import { IncomingForm, File as FormidableFile } from "formidable"

// Entfernt: versehentliches Top-Level-Try-Catch und return außerhalb von Funktionen
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("[API] process-file handler aufgerufen", req.method)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Helper to promisify formidable
  function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
    const form = new IncomingForm({ keepExtensions: true })
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })
  }

  let filePath = ""
  try {
    console.log("[API] parseForm aufgerufen")
    const { fields, files } = await parseForm(req)
    console.log("[API] File upload received", { fields, files })

    let file = files.file as FormidableFile | FormidableFile[] | undefined
    if (Array.isArray(file)) file = file[0]
    console.log("[API] file object", file)
    if (!file) {
      console.log("[API] No file provided")
      res.status(400).json({ error: "No file provided" })
      return
    }

    filePath = file.filepath
    const fileName = file.originalFilename || "uploaded_file"
    const deckName = path.basename(fileName, path.extname(fileName))
    let owner = fields.owner as string | string[] | undefined
    if (Array.isArray(owner)) owner = owner[0]
    console.log("[API] owner", owner)
    if (!owner) {
      console.log("[API] No owner provided")
      res.status(400).json({ error: "No owner provided" })
      return
    }

    // Get access token from Authorization header
    const authHeader = req.headers.authorization || ""
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined
    if (!accessToken) {
      console.log("[API] No access token provided")
      res.status(401).json({ error: "No access token provided" })
      return
    }
    console.log("[API] accessToken vorhanden")

    // Create Supabase client with user's access token
    console.log("[API] Creating Supabase client", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      owner,
    })
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )
    console.log("[API] Supabase client erstellt")

    console.log("[API] Inserting deck", { deckName, owner })
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .insert({ name: deckName, owner })
      .select("id")
      .single()
    console.log("[API] Deck insert result", { deck, deckError })
    if (deckError) {
      console.log("[API] Fehler beim Deck-Insert", deckError)
      throw deckError
    }
    if (!deck) {
      console.log("[API] Kein Deck erhalten, Abbruch")
      res.status(500).json({ error: "Deck konnte nicht erstellt werden" })
      return
    }
    const deckId = deck.id
    console.log("[API] deckId", deckId)

    if (fileName.endsWith(".pdf")) {
      console.log("[API] PDF file detected, reading and parsing")
      const dataBuffer = fs.readFileSync(filePath)
      try {
        const imported = await import("pdf-parse")
        console.log("[API] pdf-parse importiert", imported)
        // pdf-parse is a function export (CJS/ESM interop): call imported directly
        const pdfData = await (imported as unknown as (input: Buffer) => Promise<{ text: string }>)(dataBuffer)
        console.log("[API] PDF parsed text", pdfData.text?.slice(0, 200))
        const flashcards: { deck_id: string; front: string; back: string }[] = pdfData.text
          .split("\n")
          .map((line: string) => ({
            deck_id: deckId,
            front: line,
            back: "",
          }))
        console.log("[API] Flashcards to insert", flashcards.length, flashcards.slice(0, 3))
        const { error: flashcardError } = await supabase.from("cards").insert(flashcards)
        console.log("[API] Flashcard insert result", { flashcardError })
        if (flashcardError) throw flashcardError
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr)
        res.status(500).json({ error: `PDF parse error: ${pdfErr}` })
        return
      }
    } else if (fileName.endsWith(".csv")) {
      console.log("[API] CSV file detected, reading and parsing")
      const flashcards: { deck_id: string; front: string; back: string }[] = []
      try {
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row: { front: string; back: string }) => {
              flashcards.push({
                deck_id: deckId,
                front: row.front,
                back: row.back,
              })
            })
            .on("end", resolve)
            .on("error", reject)
        })
        console.log("[API] Flashcards to insert", flashcards.length, flashcards.slice(0, 3))
        const { error: flashcardError } = await supabase.from("cards").insert(flashcards)
        console.log("[API] Flashcard insert result", { flashcardError })
        if (flashcardError) throw flashcardError
      } catch (csvErr) {
        console.error("CSV parse error:", csvErr)
        res.status(500).json({ error: `CSV parse error: ${csvErr}` })
        return
      }
    } else {
      console.log("[API] Unsupported file type", fileName)
      res.status(400).json({ error: "Unsupported file type" })
      return
    }

    console.log("[API] File processed successfully")
    res.status(200).json({ message: "File processed successfully" })
    return
  } catch (error) {
    let errorString = "Unbekannter Fehler"
    if (error instanceof Error) {
      errorString = error.message + (error.stack ? `\nStack: ${error.stack}` : "")
    } else if (typeof error === "object" && error !== null) {
      try {
        errorString = JSON.stringify(error)
      } catch {
        errorString = String(error)
      }
    } else if (typeof error === "string") {
      errorString = error
    }
    console.error("API error:", errorString)
    res.status(500).json({ error: errorString })
    return
  } finally {
    if (filePath) fs.unlink(filePath, () => {})
  }
}
