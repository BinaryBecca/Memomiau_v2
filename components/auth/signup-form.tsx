"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OAuthButtons } from "./oauth-buttons"
import Link from "next/link"
import Image from "next/image"

export const SignupForm = () => {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [randomAvatarUrl, setRandomAvatarUrl] = useState<string | null>(null)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Lade automatisch ein zufälliges Avatar beim Mount
  useEffect(() => {
    handleGenerateRandomAvatar()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateRandomAvatar = async () => {
    setIsLoadingRandom(true)
    setError("")
    try {
      const response = await fetch("/api/random-avatar")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Laden des Bildes")
      }
      const data = await response.json()
      setRandomAvatarUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Generieren")
    } finally {
      setIsLoadingRandom(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.username,
        null,
        randomAvatarUrl
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join MemoMiau and start learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Avatar Selection - moved to top */}
          <div className="space-y-3">
            {randomAvatarUrl && (
              <div className="flex justify-center p-4 border rounded-lg bg-gray-50 dark:bg-slate-800">
                <Image
                  src={randomAvatarUrl}
                  alt="Zufälliges Avatar"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <Label>Wähle ein Profilbild</Label>
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                onClick={handleGenerateRandomAvatar}
                disabled={isLoadingRandom || loading}
                variant="outline"
                size="sm">
                {isLoadingRandom ? "Lädt..." : "Zufälliges Katzenbild"}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your unique username"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <OAuthButtons />

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-purple-600 dark:text-purple-400 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
