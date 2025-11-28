"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AccountPage() {
  const [editMode, setEditMode] = useState(false)
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  })
  const [randomAvatarUrl, setRandomAvatarUrl] = useState<string | null>(null)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        username: profile.username,
        email: profile.email,
      })
    }
  }, [profile])

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

  const handleSaveRandomAvatar = async () => {
    if (!randomAvatarUrl || !user?.id) return
    setIsLoading(true)
    setError("")
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: randomAvatarUrl,
          preset_avatar: null,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      // Profil neu laden
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      if (fetchError) throw fetchError

      if (updatedProfile && profile) {
        Object.assign(profile, updatedProfile)
      }

      setSuccess("Profilbild erfolgreich aktualisiert!")
      setShowNotification(true)
      setRandomAvatarUrl(null)
      setEditMode(false)
      setTimeout(() => {
        setShowNotification(false)
        setSuccess("")
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      if (!user?.id) throw new Error("User not found")

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      // Profil nach Update neu laden und Vorschau aktualisieren
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      if (fetchError) throw fetchError
      // Falls useAuth kein setter bietet, lokal updaten:
      if (updatedProfile) {
        setFormData({
          firstName: updatedProfile.first_name || "",
          lastName: updatedProfile.last_name || "",
          username: updatedProfile.username,
          email: updatedProfile.email,
        })
        // Vorschau: Profile-Objekt updaten (nur falls nicht automatisch)
        if (profile) {
          Object.assign(profile, updatedProfile)
        }
      }
      setSuccess("Profil erfolgreich aktualisiert!")
      setEditMode(false)
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
        setSuccess("")
      }, 2500)
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

        {/* Profil-Vorschau */}
        <div className="flex items-start gap-6 p-8 mb-8 bg-white dark:bg-slate-900 rounded-xl shadow border border-gray-200 dark:border-slate-800">
          <Avatar className="w-32 h-32 flex-shrink-0">
            <AvatarImage src={randomAvatarUrl || profile?.avatar_url || ""} />
            <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2 flex-1">
            {editMode ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2" autoComplete="off">
                {/* Avatar-Generierung */}
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-slate-700">
                  <Label className="text-sm mb-2 block">Profilbild ändern</Label>
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      onClick={handleGenerateRandomAvatar}
                      disabled={isLoadingRandom || isLoading}
                      variant="outline"
                      size="sm">
                      {isLoadingRandom ? "Lädt..." : "Zufälliges Katzenbild"}
                    </Button>
                    {randomAvatarUrl && (
                      <>
                        <Button type="button" onClick={handleSaveRandomAvatar} disabled={isLoading} size="sm">
                          Übernehmen
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setRandomAvatarUrl(null)}
                          disabled={isLoading}
                          variant="outline"
                          size="sm">
                          Verwerfen
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Benutzername"
                  className="text-2xl font-bold"
                  disabled={isLoading}
                />
                <div className="flex gap-2">
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Vorname"
                    className="text-base"
                    disabled={isLoading}
                  />
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nachname"
                    className="text-base"
                    disabled={isLoading}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{formData.email || user?.email || "-"}</div>

                <div className="flex gap-2 mt-2">
                  <Button type="submit" disabled={isLoading} size="sm">
                    {isLoading ? "Speichern..." : "Speichern"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(false)
                      setRandomAvatarUrl(null)
                      setError("")
                    }}
                    disabled={isLoading}>
                    Abbrechen
                  </Button>
                </div>
                {error && (
                  <div className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-xs mt-2">
                    {error}
                  </div>
                )}
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.username || "-"}</div>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                    Bearbeiten
                  </Button>
                </div>
                <div className="text-base text-gray-700 dark:text-gray-300">
                  {profile?.first_name || "-"} {profile?.last_name || "-"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{profile?.email || user?.email || "-"}</div>
                {showNotification && (
                  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-green-600 text-white rounded shadow-lg animate-fade-in-out">
                    {success}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6">
          <Button onClick={signOut} className="w-full">
            Abmelden
          </Button>
        </div>
      </div>
    </div>
  )
}
