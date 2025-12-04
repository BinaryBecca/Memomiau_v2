import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "next-themes"
import ChatbotFABClient from "@/components/ui/chatbot-fab-client"
import ChatProviderWrapper from "@/components/chat/ChatProviderWrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "MemoMiau",
  description: "Learn with Flashcards",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ChatProviderWrapper>
            <Navbar />
            {children}
            {/* Chatbot Floating Action Button */}
            <ChatbotFABClient />
          </ChatProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
