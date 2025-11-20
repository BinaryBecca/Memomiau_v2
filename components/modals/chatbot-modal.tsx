"use client"
import { X } from "lucide-react"
import ChatBot from "@/components/chatbot"

export const ChatbotModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  if (!open) return null
  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-800 flex flex-col"
      style={{ minHeight: 400, maxHeight: "80vh" }}>
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition"
        aria-label="Schließen">
        <X className="w-5 h-5" />
      </button>
      <div className="p-6 pt-10 overflow-y-auto flex-1">
        <ChatBot />
      </div>
    </div>
  )
}
export default ChatbotModal
