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
  if (!pathname) return null

  // Hide on landing page
  if (pathname === "/") return null

  // Explicitly hide on auth-related pages (covers common login/sign-up paths)
  const hidePaths = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/sign-up-success",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/confirm",
    "/login",
    "/sign-up",
    "/signup",
  ]

  for (const p of hidePaths) {
    if (pathname === p || pathname.startsWith(p + "/")) return null
  }

  // Fallback: hide on any /auth/* route
  if (pathname.startsWith("/auth")) return null

  return <ChatbotFAB />
}
