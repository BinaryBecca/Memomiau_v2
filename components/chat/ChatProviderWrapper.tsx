"use client"

import React from "react"
import { ChatProvider } from "./ChatProvider"

const ChatProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ChatProvider>{children}</ChatProvider>
}

export default ChatProviderWrapper
