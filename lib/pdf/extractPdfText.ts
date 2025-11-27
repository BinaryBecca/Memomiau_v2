import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js"

/**
 * Extrahiert reinen Fließtext aus einem PDF-Buffer, entfernt Kopf-/Fußzeilen und doppelte Leerzeichen.
 * @param fileBuffer Buffer des PDF-Dokuments
 * @returns Promise<string> Gesamter Text
 */
export async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: fileBuffer })
  const pdf = await loadingTask.promise
  let text = ""
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Nur Fließtext, keine Layout-Infos
    let pageText = content.items.map((item: any) => item.str).join(" ")
    // Entferne doppelte Leerzeichen
    pageText = pageText.replace(/\s+/g, " ").trim()
    // Optional: Kopf-/Fußzeilen entfernen (hier: Zeilen < 10 Zeichen am Anfang/Ende)
    const lines = pageText.split("\n").filter((line) => line.trim().length > 10)
    pageText = lines.join(" ")
    text += pageText + "\n"
  }
  // Gesamten Text nochmal säubern
  return text.replace(/\s+/g, " ").trim()
}
