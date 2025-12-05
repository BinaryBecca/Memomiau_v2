import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "next-themes"
import ChatbotFABClient from "@/components/ui/chatbot-fab-client"
import ChatProviderWrapper from "@/components/chat/ChatProviderWrapper"
import "./globals.css"
import { NotificationProvider } from "@/components/ui/notification"
// NotificationModal is rendered by NotificationProvider
import ConfirmProvider from "@/components/ui/confirm"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MemoMiau",
  description: "Learn with Flashcards",
  icons: {
    icon: "/memomiau_favicon.png",
    shortcut: "/memomiau_favicon.png",
    apple: "/memomiau_favicon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>{/* Preload kritischer Ressourcen für bessere LCP */}</head>
      <body className={inter.variable}>
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
