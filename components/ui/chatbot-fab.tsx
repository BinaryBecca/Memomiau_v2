"use client"
import Image from "next/image"
import { useState } from "react"
import ChatbotModal from "@/components/modals/chatbot-modal"

const ChatbotFAB = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 bg-[#f984dd] hover:bg-[#e06bbf] text-white rounded-full shadow-lg p-0 flex items-center justify-center w-16 h-16 transition-all border-4 border-white dark:border-slate-900"
        aria-label="Chatbot öffnen"
        onClick={() => setOpen(true)}>
        <div className="w-8 h-8 relative">
          <Image src="/icon_chat_paw_white.svg" alt="Chat" fill sizes="32px" />
        </div>
      </button>
      <ChatbotModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export default ChatbotFAB
