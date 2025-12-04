import ChatbotFABClient from "./chatbot-fab-client"
import { createClient } from "@/lib/supabase/server"

export default async function ChatbotFABServer() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()

  if (!data?.session) return null

  // session exists - render client wrapper (it will still hide on '/')
  return <ChatbotFABClient />
}
