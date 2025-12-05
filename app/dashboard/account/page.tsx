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
  const [notificationTimeout, setNotificationTimeout] = useState<NodeJS.Timeout | null>(null)

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout)
      }
    }
  }, [notificationTimeout])

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
        // Vermeide direkte Mutation des profile-Objekts für bessere Hydration
        // Stattdessen nur die lokalen States aktualisieren
        setFormData({
          firstName: updatedProfile.first_name || "",
          lastName: updatedProfile.last_name || "",
          username: updatedProfile.username,
          email: updatedProfile.email,
        })
      }

      setSuccess("Profilbild erfolgreich aktualisiert!")
      setShowNotification(true)
      setRandomAvatarUrl(null)
      setEditMode(false)

      // Clear existing timeout if any
      if (notificationTimeout) {
        clearTimeout(notificationTimeout)
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        setShowNotification(false)
        setSuccess("")
        setNotificationTimeout(null)
      }, 2500)
      setNotificationTimeout(timeout)
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
        // Entferne direkte Mutation des profile-Objekts
      }
      setSuccess("Profil erfolgreich aktualisiert!")
      setEditMode(false)
      setShowNotification(true)

      // Clear existing timeout if any
      if (notificationTimeout) {
        clearTimeout(notificationTimeout)
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        setShowNotification(false)
        setSuccess("")
        setNotificationTimeout(null)
      }, 2500)
      setNotificationTimeout(timeout)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Aktualisieren")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition mr-3 sm:mr-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Konto</h1>
        </div>

        {/* Profil-Vorschau */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-8 mb-8 bg-white dark:bg-slate-900 rounded-xl shadow border border-gray-200 dark:border-slate-800">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 mx-auto sm:mx-0">
            <AvatarImage src={randomAvatarUrl || profile?.avatar_url || ""} />
            <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2 flex-1 w-full sm:w-auto">
            {editMode ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2" autoComplete="off">
                {/* Avatar-Generierung */}
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-slate-700">
                  <Label className="text-sm mb-2 block">Profilbild ändern</Label>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <Button
                      type="button"
                      onClick={handleGenerateRandomAvatar}
                      disabled={isLoadingRandom || isLoading}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto">
                      {isLoadingRandom ? "Lädt..." : "Zufälliges Katzenbild"}
                    </Button>
                    {randomAvatarUrl && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          onClick={handleSaveRandomAvatar}
                          disabled={isLoading}
                          size="sm"
                          className="w-full sm:w-auto">
                          Übernehmen
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setRandomAvatarUrl(null)}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto">
                          Verwerfen
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Benutzername"
                  className="text-xl"
                  disabled={isLoading}
                />
                <div className="flex flex-col sm:flex-row gap-2">
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

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button type="submit" disabled={isLoading} size="sm" className="w-full sm:w-auto" variant="pink">
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
                    disabled={isLoading}
                    className="w-full sm:w-auto">
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
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.username || "-"}</div>
                </div>
                <div className="text-base text-gray-700 dark:text-gray-300 pb-2">
                  {profile?.first_name || "-"} {profile?.last_name || "-"}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(true)}
                  className="self-start sm:self-auto">
                  Bearbeiten
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Success Notification */}
        {showNotification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-green-600 text-white rounded shadow-lg text-center">
            {success}
          </div>
        )}

        {/* Logout */}
        <div className="mt-6 sm:mt-8">
          <Button onClick={signOut} className="w-full sm:w-auto">
            Abmelden
          </Button>
        </div>
      </div>
    </div>
  )
}
