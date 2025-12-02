"use client"

import { useCallback, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"

const getStartOfDay = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

export const useAchievements = () => {
  const { user } = useAuth()
  const supabase = createClient()
  const [stats, setStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    streak: 0,
    totalCards: 0,
    learningDaysThisMonth: 0,
    dailyData: [] as { date: string; count: number }[],
    monthlyData: [] as { month: string; count: number }[],
    yearlyData: [] as { year: string; count: number }[],
  })
  const [loading, setLoading] = useState(true)

  // localStorage key for user-specific stats
  const getStorageKey = useCallback(() => {
    return user ? `achievements_${user.id}` : null
  }, [user])

  // Load stats from localStorage
  const loadFromStorage = useCallback(() => {
    const key = getStorageKey()
    if (!key) return null

    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("Error loading achievements from localStorage:", error)
      return null
    }
  }, [getStorageKey])

  // Save stats to localStorage
  const saveToStorage = useCallback(
    (statsData: typeof stats) => {
      const key = getStorageKey()
      if (!key) return

      try {
        localStorage.setItem(key, JSON.stringify(statsData))
      } catch (error) {
        console.error("Error saving achievements to localStorage:", error)
      }
    },
    [getStorageKey]
  )

  const calculateAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // First, try to load from localStorage for immediate display
      const storedStats = loadFromStorage()
      if (storedStats) {
        setStats(storedStats)
      }

      // Then fetch fresh data from database
      const { data, error } = await supabase
        .from("card_learning_status")
        .select("card_id, updated_at")
        .eq("user_id", user.id)

      if (error) throw error

      let newStats = {
        daily: 0,
        weekly: 0,
        monthly: 0,
        streak: 0,
        totalCards: 0,
        learningDaysThisMonth: 0,
        dailyData: [] as { date: string; count: number }[],
        monthlyData: [] as { month: string; count: number }[],
        yearlyData: [] as { year: string; count: number }[],
      }

      if (data && data.length > 0) {
        const today = getStartOfDay(new Date())
        const oneDay = 24 * 60 * 60 * 1000
        const sevenDaysAgo = new Date(today.getTime() - 6 * oneDay)
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const learningTimestamps = data.map((item) => new Date(item.updated_at!).getTime())

        const daily = learningTimestamps.filter(
          (ts) => getStartOfDay(new Date(ts)).getTime() === today.getTime()
        ).length
        const weekly = learningTimestamps.filter((ts) => new Date(ts) >= sevenDaysAgo).length
        const monthly = learningTimestamps.filter((ts) => new Date(ts) >= startOfMonth).length
        const totalCards = new Set(data.map((item) => item.card_id)).size

        const sortedUniqueDates = [
          ...new Set(data.map((item) => getStartOfDay(new Date(item.updated_at!)).getTime())),
        ].sort((a, b) => b - a)

        const learningDaysThisMonth = sortedUniqueDates.filter((d) => d >= startOfMonth.getTime()).length

        // Calculate streak
        let streak = 0

        if (sortedUniqueDates.length > 0) {
          const mostRecentDate = sortedUniqueDates[0]

          if (mostRecentDate === today.getTime() || mostRecentDate === today.getTime() - oneDay) {
            streak = 1
            let lastDate = mostRecentDate
            for (let i = 1; i < sortedUniqueDates.length; i++) {
              const currentDate = sortedUniqueDates[i]
              if (lastDate - currentDate === oneDay) {
                streak++
                lastDate = currentDate
              } else {
                break // Gap in streak
              }
            }
          }
        }

        const thirtyDaysAgo = new Date(today.getTime() - 29 * oneDay)

        const dailyData = []
        for (let i = 0; i < 30; i++) {
          const date = new Date(today.getTime() - i * oneDay)
          const dateStr = date.toISOString().split("T")[0]
          const count = learningTimestamps.filter(
            (ts) => getStartOfDay(new Date(ts)).getTime() === date.getTime()
          ).length
          dailyData.push({ date: dateStr, count })
        }

        // Monthly data for last 12 months
        const monthlyData = []
        for (let i = 0; i < 12; i++) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const monthStr = date.toLocaleDateString("de-DE", { month: "short", year: "numeric" })
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          const count = learningTimestamps.filter((ts) => {
            const tsDate = new Date(ts)
            return tsDate >= startOfMonth && tsDate <= endOfMonth
          }).length
          monthlyData.push({ month: monthStr, count })
        }

        // Yearly data for last 5 years
        const yearlyData = []
        for (let i = 0; i < 5; i++) {
          const year = today.getFullYear() - i
          const startOfYear = new Date(year, 0, 1)
          const endOfYear = new Date(year, 11, 31)
          const count = learningTimestamps.filter((ts) => {
            const tsDate = new Date(ts)
            return tsDate >= startOfYear && tsDate <= endOfYear
          }).length
          yearlyData.push({ year: year.toString(), count })
        }

        newStats = {
          ...newStats,
          daily,
          weekly,
          monthly,
          totalCards,
          streak,
          learningDaysThisMonth,
          dailyData: dailyData.reverse(),
          monthlyData: monthlyData.reverse(),
          yearlyData: yearlyData.reverse(),
        }
      }

      // Update state and save to localStorage
      setStats(newStats)
      saveToStorage(newStats)
    } catch (error) {
      console.error("Error calculating achievements:", error)
      // If there's an error, try to use stored data as fallback
      const storedStats = loadFromStorage()
      if (storedStats) {
        setStats(storedStats)
      } else {
        setStats({
          daily: 0,
          weekly: 0,
          monthly: 0,
          streak: 0,
          totalCards: 0,
          learningDaysThisMonth: 0,
          dailyData: [],
          monthlyData: [],
          yearlyData: [],
        })
      }
    } finally {
      setLoading(false)
    }
  }, [user, supabase, loadFromStorage, saveToStorage])

  useEffect(() => {
    calculateAchievements()
  }, [calculateAchievements])

  return { stats, loading, refetch: calculateAchievements }
}
