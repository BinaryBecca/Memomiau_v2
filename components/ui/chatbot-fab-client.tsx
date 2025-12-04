"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import ChatbotFAB from "@/components/ui/chatbot-fab"
import { createClient } from "@/lib/supabase/client"

export default function ChatbotFABClient() {
  const pathname = usePathname()
  const [sessionExists, setSessionExists] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setSessionExists(Boolean(data?.session)))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionExists(Boolean(session))
    })
    return () => data.subscription?.unsubscribe()
  }, [])

  if (!sessionExists) return null
  if (pathname === "/") return null

  return <ChatbotFAB />
}
