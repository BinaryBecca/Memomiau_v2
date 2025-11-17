"use client"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export const OAuthButtons = () => {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Google signin failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGoogleSignIn} disabled={loading} variant="outline" className="w-full">
      {loading ? "Signing in..." : "🔐 Continue with Google"}
    </Button>
  )
}
