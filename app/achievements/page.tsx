"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useAchievements } from "@/hooks/useAchievements"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Flame, BookOpen } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import LoadingCat from "@/components/cat-loader"

export default function AchievementsPage() {
  const { user, loading: authLoading } = useAuth()
  const { stats, loading: achievementsLoading } = useAchievements()
  const [activeTab, setActiveTab] = useState("daily")
  const [showLoader, setShowLoader] = useState(true)

  const loading = authLoading || achievementsLoading

  // Loader für mindestens 3 Sekunden anzeigen
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowLoader(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setShowLoader(true)
    }
  }, [loading])

  if (showLoader) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingCat />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Melde dich an, um deine Achievements zu sehen</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h1>
          <p className="text-gray-600 dark:text-gray-400">Verfolge deinen Lernfortschritt</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lern-Streak</CardTitle>
              <Flame className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tage in Folge</p>
            </CardContent>
          </Card>

          {/* Total Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gelernte Karten</CardTitle>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Insgesamt</p>
            </CardContent>
          </Card>

          {/* Learning Days */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lerntage</CardTitle>
              <Calendar className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.learningDaysThisMonth}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">In diesem Monat</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time-based Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Gelernte Karten pro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="daily">Tag</TabsTrigger>
                  <TabsTrigger value="monthly">Monat</TabsTrigger>
                  <TabsTrigger value="yearly">Jahr</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}`
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}.${date.getFullYear()}`
                        }}
                        formatter={(value) => [value, "Karten"]}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="monthly" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Karten"]} />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Karten"]} />
                      <Bar dataKey="count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Sammle Badges durch Lernmeilensteine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Starter Badge */}
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="text-3xl mb-2">🥇</div>
                  <p className="text-sm font-semibold">Starter</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">✓ Erledigt</p>
                </div>

                {/* Pro Badge */}
                <div
                  className={`text-center p-4 rounded-lg ${
                    stats.totalCards >= 100 ? "bg-blue-50 dark:bg-blue-950" : "bg-gray-100 dark:bg-slate-800 opacity-50"
                  }`}>
                  <div className="text-3xl mb-2">🥈</div>
                  <p className="text-sm font-semibold">Pro</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats.totalCards >= 100 ? "✓ Erledigt" : `${stats.totalCards}/100 Karten`}
                  </p>
                </div>

                {/* Master Badge */}
                <div
                  className={`text-center p-4 rounded-lg ${
                    stats.totalCards >= 500
                      ? "bg-purple-50 dark:bg-purple-950"
                      : "bg-gray-100 dark:bg-slate-800 opacity-50"
                  }`}>
                  <div className="text-3xl mb-2">🥉</div>
                  <p className="text-sm font-semibold">Master</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats.totalCards >= 500 ? "✓ Erledigt" : `${stats.totalCards}/500 Karten`}
                  </p>
                </div>

                {/* Streak Badge */}
                <div
                  className={`text-center p-4 rounded-lg ${
                    stats.streak >= 7 ? "bg-orange-50 dark:bg-orange-950" : "bg-gray-100 dark:bg-slate-800 opacity-50"
                  }`}>
                  <div className="text-2xl mb-2">🔥</div>
                  <p className="text-sm font-semibold">Streak</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats.streak >= 7 ? "✓ Erledigt" : `${stats.streak}/7 Tage Streak`}
                  </p>
                </div>

                {/* Streak Master Badge */}
                <div
                  className={`text-center p-4 rounded-lg ${
                    stats.streak >= 30 ? "bg-red-50 dark:bg-red-950" : "bg-gray-100 dark:bg-slate-800 opacity-50"
                  }`}>
                  <div className="text-2xl mb-2">🔥🔥</div>
                  <p className="text-sm font-semibold">Streak Master</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats.streak >= 30 ? "✓ Erledigt" : `${stats.streak}/30 Tage Streak`}
                  </p>
                </div>

                {/* Streak Master Badge */}
                <div
                  className={`text-center p-4 rounded-lg ${
                    stats.streak >= 365 ? "bg-red-50 dark:bg-red-950" : "bg-gray-100 dark:bg-slate-800 opacity-50"
                  }`}>
                  <div className="text-2xl mb-2">🔥🔥🔥</div>
                  <p className="text-sm font-semibold">Streak Slayer</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats.streak >= 365 ? "✓ Erledigt" : `${stats.streak}/365 Tage Streak`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
