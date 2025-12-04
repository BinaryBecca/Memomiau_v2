"use client"
import Image from "next/image"
import { X } from "lucide-react"
import ChatBot from "@/components/chatbot"
import { useEffect, useState } from "react"

export const ChatbotModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [show, setShow] = useState(false)
  const [isMounted, setIsMounted] = useState(open)
  const ANIM_DURATION = 700

  useEffect(() => {
    let timeout: number | undefined

    if (open) {
      // mount and trigger enter animation
      setIsMounted(true)
      setShow(false)
      const raf = requestAnimationFrame(() => setShow(true))
      return () => cancelAnimationFrame(raf)
    }

    if (!open && isMounted) {
      // trigger exit animation, then unmount
      setShow(false)
      timeout = window.setTimeout(() => setIsMounted(false), ANIM_DURATION)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [open, isMounted])

  if (!isMounted) return null

  return (
    <div
      className={`fixed inset-0 h-screen sm:h-auto sm:inset-auto sm:bottom-6 sm:left-auto sm:right-6 z-50 w-full max-w-[100vw] sm:max-w-[24rem] sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-xl rounded-none shadow-xl border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden transform transition-all duration-700 ease-out ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)", paddingTop: "env(safe-area-inset-top)" }}>
      {/* Dark Header Bar */}
      <div className="bg-[#f984dd] dark:bg-[#f984dd] text-white px-4 py-3 flex items-center justify-between sm:rounded-t-xl rounded-none">
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
          className="p-2.5 sm:p-1.5 rounded-full hover:bg-slate-700 transition"
          aria-label="Schließen">
          <X className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>
      </div>
      {/* Chat Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChatBot />
      </div>
    </div>
  )
}
export default ChatbotModal
