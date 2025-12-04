"use client"
import React, { createContext, useContext, useState, ReactNode } from "react"
import NotificationModal from "@/components/modals/notification-modal"

type Notification = {
  id: string
  title: string
  description?: string
}

type NotificationContextValue = {
  notify: (title: string, description?: string) => void
  clear: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null)

  const notify = (title: string, description?: string) => {
    setNotification({ id: String(Date.now()), title, description })
  }

  const clear = () => setNotification(null)

  return (
    <NotificationContext.Provider value={{ notify, clear }}>
      {children}
      <NotificationModal
        open={!!notification}
        title={notification?.title || ""}
        description={notification?.description || undefined}
        onClose={() => setNotification(null)}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider")
  return ctx
}

export default NotificationProvider
