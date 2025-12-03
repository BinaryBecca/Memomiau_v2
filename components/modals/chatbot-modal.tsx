"use client"
import Image from "next/image"
import { X } from "lucide-react"
import ChatBot from "@/components/chatbot"

export const ChatbotModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  if (!open) return null
  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 w-full max-w-[100vw] sm:max-w-[24rem] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden">
      {/* Dark Header Bar */}
      <div className="bg-[#f984dd] dark:bg-[#f984dd] text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-800 overflow-hidden">
            <Image src="/icon_chat_paw_pink.svg" alt="Chat icon" width={24} height={24} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">MemoMiau</h3>
            <p className="text-xs ">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="p-1.5 rounded-full hover:bg-slate-700 transition"
          aria-label="Schließen">
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto">
        <ChatBot />
      </div>
    </div>
  )
}
export default ChatbotModal
