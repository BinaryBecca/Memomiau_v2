import type { NextApiRequest, NextApiResponse } from "next"
import formidable from "formidable"
import fs from "fs"
// Try alternative import for pdfjs-dist compatibility
import * as pdfjsLib from "pdfjs-dist"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.js"
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const form = new formidable.IncomingForm({ keepExtensions: true })
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File upload error" })
    }
    let file: any = files[Object.keys(files)[0]]
    if (Array.isArray(file)) file = file[0]
    if (!file || typeof file !== "object" || !("filepath" in file)) {
      return res.status(400).json({ error: "No file provided" })
    }
    const filePath = file.filepath
    try {
      const dataBuffer = fs.readFileSync(filePath)
      // PDF mit pdfjs-dist laden
      const loadingTask = pdfjsLib.getDocument({ data: dataBuffer })
      const pdf = await loadingTask.promise
      let text = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item: any) => item.str).join(" ") + "\n"
      }
      res.status(200).json({ text })
    } catch (error) {
      res.status(500).json({ error: String(error) })
    } finally {
      fs.unlink(filePath, () => {})
    }
  })
}
