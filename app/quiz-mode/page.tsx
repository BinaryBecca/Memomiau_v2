"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Play, Clock } from "lucide-react"
import LoadingCat from "@/components/cat-loader"

export default function QuizModePage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [sessionName, setSessionName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  // Loader für mindestens 3 Sekunden anzeigen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // TODO: Implement quiz session creation in Supabase
      console.log("Creating quiz session:", sessionName)

      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add to sessions
      const newSession = {
        id: Math.random().toString(36).substr(2, 9),
        name: sessionName,
        createdAt: new Date().toISOString(),
        participants: 0,
      }
      setSessions([newSession, ...sessions])
      setSessionName("")
      setShowCreate(false)
    } catch (error) {
      console.error("Error creating session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showLoader ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingCat />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Mode</h1>
              <p className="text-gray-600 dark:text-gray-400">Tritt gegen andere Nutzer an und teste dein Wissen</p>
            </div>

            {!user ? (
              <Card className="border-2 border-dashed">
                <CardHeader className="text-center">
                  <CardTitle>Melde dich an, um zu spielen</CardTitle>
                  <CardDescription>Quiz Mode ist nur für angemeldete Nutzer verfügbar</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <>
                {/* Create Session */}
                <div className="mb-8">
                  {!showCreate ? (
                    <Button onClick={() => setShowCreate(true)} size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Neue Quiz-Session erstellen
                    </Button>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Neue Quiz-Session</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateSession} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="sessionName">Session Name</Label>
                            <Input
                              id="sessionName"
                              placeholder="Z.B. Biologie Quiz"
                              value={sessionName}
                              onChange={(e) => setSessionName(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCreate(false)
                                setSessionName("")
                              }}
                              disabled={isLoading}>
                              Abbrechen
                            </Button>
                            <Button type="submit" disabled={isLoading || !sessionName.trim()}>
                              {isLoading ? "Wird erstellt..." : "Session erstellen"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Active Sessions */}
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎮</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Keine aktiven Sessions</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Erstelle eine neue Session, um mit anderen zu spielen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aktive Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sessions.map((session) => (
                        <Card key={session.id} className="hover:shadow-lg transition">
                          <CardHeader>
                            <CardTitle className="text-lg">{session.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{session.participants} Teilnehmer</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(session.createdAt).toLocaleTimeString("de-DE")}</span>
                            </div>
                            <Button className="w-full">
                              <Play className="w-4 h-4 mr-2" />
                              Beitreten
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
