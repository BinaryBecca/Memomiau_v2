"use client"

import React, { createContext, useContext, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { createClient } from "@/lib/supabase/client"

type ChatContextValue = ReturnType<typeof useChat> & { initialized: boolean }

const ChatContext = createContext<ChatContextValue | null>(null)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const chat = useChat()

  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        try {
          if (typeof chat.setMessages === "function") chat.setMessages([])
        } catch (e) {
          // ignore
        }
      }
    })

    return () => data.subscription?.unsubscribe()
  }, [chat])

  const value = { ...chat, initialized: true } as ChatContextValue

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider")
  return ctx
}

export default ChatProvider
