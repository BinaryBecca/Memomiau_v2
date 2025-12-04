import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "next-themes"
import ChatbotFABClient from "@/components/ui/chatbot-fab-client"
import ChatProviderWrapper from "@/components/chat/ChatProviderWrapper"
import "./globals.css"
import { NotificationProvider } from "@/components/ui/notification"
// NotificationModal is rendered by NotificationProvider
import ConfirmProvider from "@/components/ui/confirm"

export const metadata: Metadata = {
  title: "MemoMiau",
  description: "Learn with Flashcards",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NotificationProvider>
            <ConfirmProvider>
              <ChatProviderWrapper>
                <Navbar />
                {children}
                {/* Chatbot Floating Action Button */}
                <ChatbotFABClient />
              </ChatProviderWrapper>
            </ConfirmProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
