"use client"
import { useState } from "react"
import ChatbotModal from "@/components/modals/chatbot-modal"

// SVG-Icon: Sprechblase mit Katzenpfote
const CatChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F3E8FF" />
    <path
      d="M10 20c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5c0 2.5-2.5 4.5-6 4.5-.7 0-1.4-.1-2-.3l-3 1 1-2c-1.3-.8-2-2-2-3.2z"
      fill="#A78BFA"
    />
    <circle cx="13.5" cy="21" r="1" fill="#fff" />
    <circle cx="18.5" cy="21" r="1" fill="#fff" />
    <ellipse cx="16" cy="18" rx="1.5" ry="1" fill="#fff" />
    <path d="M12.5 15.5c.5-.5 1.5-1 2.5-1s2 .5 2.5 1" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const ChatbotFAB = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-0 flex items-center justify-center w-16 h-16 transition-all border-4 border-white dark:border-slate-900"
        aria-label="Chatbot öffnen"
        onClick={() => setOpen(true)}>
        <CatChatIcon />
      </button>
      <ChatbotModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export default ChatbotFAB
