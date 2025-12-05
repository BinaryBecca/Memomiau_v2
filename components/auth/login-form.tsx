"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OAuthButtons } from "./oauth-buttons"
import Link from "next/link"
import LoadingCat from "@/components/cat-loader"

export const LoginForm = () => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showLoader, setShowLoader] = useState(true)

  // Loader für mindestens 3 Sekunden anzeigen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      {showLoader ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingCat />
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Willkommen zurück!</CardTitle>
            <CardDescription>Melde dich mit deinem MemoMiau Konto an.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Anmeldung..." : "Anmelden"}
              </Button>
            </form>

            <OAuthButtons />

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Noch kein Konto?{" "}
              <Link href="/auth/signup" className="text-purple-600 dark:text-purple-400 hover:underline">
                Registriere dich hier
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
