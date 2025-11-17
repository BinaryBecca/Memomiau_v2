"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PRESET_AVATARS } from "@/lib/constants"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AccountPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  })
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        username: profile.username,
        email: profile.email,
      })
      setSelectedAvatar(profile.preset_avatar)
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      if (!user?.id) throw new Error("User not found")

      const avatarData = PRESET_AVATARS.find((a) => a.id === selectedAvatar)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          preset_avatar: selectedAvatar,
          avatar_url: avatarData?.url || null,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Profil erfolgreich aktualisiert!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Aktualisieren")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition mr-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Konto</h1>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profilbild</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>{profile?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{profile?.username}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Wähle ein neues Avatar-Bild</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`p-2 rounded-lg transition border-2 ${
                      selectedAvatar === avatar.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                    }`}
                    title={avatar.name}>
                    <img src={avatar.url} alt={avatar.name} className="w-full h-auto rounded" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profilinformationen</CardTitle>
            <CardDescription>Aktualisiere deine persönlichen Daten</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" value={formData.email} disabled />
                <p className="text-xs text-gray-600 dark:text-gray-400">E-Mail kann nicht geändert werden</p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Wird gespeichert..." : "Änderungen speichern"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Sicherheit</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={signOut} variant="destructive" className="w-full">
              Abmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
