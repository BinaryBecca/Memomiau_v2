"use client"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Trophy, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="w-full flex justify-center md:justify-end">
              <div className="w-full max-w-lg">
                <Image
                  src="/memomiau_hero.png"
                  alt="MemoMiau Hero"
                  width={780}
                  height={468}
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-6 gap-4">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">MemoMiau</h1>
                <div className="hidden md:flex w-18 h-18 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full md:items-center md:justify-center text-5xl">
                  <Image
                    src="/memomiau_logo.png"
                    alt="Memomiau-Logo"
                    width={60}
                    height={60}
                    className="rounded-full"
                    priority={true}
                    sizes="80px"
                  />
                </div>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto md:mx-0">
                Lerne effizienter mit Flashcards. Erstelle, teile und beherrsche jedes Thema mit KI-unterstütztem
                Lernen.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Button size="lg" variant="pink" asChild>
                  <Link href="/auth/signup">Kostenlos starten</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/login">Einloggen</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-8 flex justify-center md:justify-start">
          <div className="flex md:hidden w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center text-6xl shadow-lg">
            <Image
              src="/memomiau_logo.png"
              alt="Memomiau-Logo Mobile"
              width={104}
              height={104}
              className="rounded-full"
              priority
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <CardTitle>Erstelle Decks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Erstelle deine eigenen Flashcard-Decks oder lasse die KI sie generieren.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-2" />
              <CardTitle>Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Teile deine Decks mit der Community und lerne von anderen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-2" />
              <CardTitle>Quiz Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Tritt gegen andere Nutzer an und teste dein Wissen in Echtzeit.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Verfolge deinen Lernfortschritt und sammle Achievements.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-[#f785db] rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Bereit zum Lernen?</h2>
          <p className="text-lg mb-8 text-purple-100">Starte jetzt und verbessere dein Lernverhalten</p>
          <Button size="lg" variant="pink" asChild>
            <Link href="/auth/signup">Jetzt kostenlos anmelden</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
