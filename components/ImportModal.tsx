import React, { useRef } from "react"
import { useFlashcardImport } from "@/hooks/useFlashcardImport"
import { Flashcard } from "@/types/flashcards"

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (cards: Flashcard[], file: File | null) => void
}

export const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onConfirm }) => {
  const { loading, error, cards, importFile, importFromFile } = useFlashcardImport()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) importFromFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      importFromFile(e.dataTransfer.files[0])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Importiere Flashcards</h2>
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center mb-4 cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}>
          <input type="file" accept=".pdf,.csv" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          {importFile ? (
            <span>Datei: {importFile.name}</span>
          ) : (
            <span>Datei hierher ziehen oder klicken zum Auswählen (PDF/CSV)</span>
          )}
        </div>
        {loading && <div className="text-blue-600 mb-2">KI generiert Flashcards...</div>}
        {error && <div className="text-red-600 mb-2">Fehler: {error}</div>}
        {cards && (
          <div className="max-h-48 overflow-y-auto border rounded p-2 mb-4 bg-gray-50">
            <ul className="text-sm">
              {cards.map((card, idx) => (
                <li key={idx} className="mb-2">
                  <b>Q:</b> {card.front}
                  <br />
                  <b>A:</b> {card.back}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose} disabled={loading}>
            Abbrechen
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={!cards || cards.length === 0 || loading}
            onClick={() => cards && onConfirm(cards, importFile)}>
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  )
}
