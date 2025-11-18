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
  })
  const [loading, setLoading] = useState(true)

  const calculateAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("card_learning_status")
        .select("card_id, updated_at")
        .eq("user_id", user.id)

      if (error) throw error

      if (data && data.length > 0) {
        const today = getStartOfDay(new Date())
        const oneDay = 24 * 60 * 60 * 1000
        const sevenDaysAgo = new Date(today.getTime() - 6 * oneDay)
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const learningTimestamps = data.map((item) => new Date(item.updated_at!).getTime())

        const daily = learningTimestamps.filter((ts) => getStartOfDay(new Date(ts)).getTime() === today.getTime()).length
        const weekly = learningTimestamps.filter((ts) => new Date(ts) >= sevenDaysAgo).length
        const monthly = learningTimestamps.filter((ts) => new Date(ts) >= startOfMonth).length
        const totalCards = new Set(data.map((item) => item.card_id)).size

        const sortedUniqueDates = [...new Set(data.map((item) => getStartOfDay(new Date(item.updated_at!)).getTime()))].sort(
          (a, b) => b - a
        )
        
        const learningDaysThisMonth = sortedUniqueDates.filter(d => d >= startOfMonth.getTime()).length

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

        setStats({ daily, weekly, monthly, totalCards, streak, learningDaysThisMonth })
      } else {
        setStats({ daily: 0, weekly: 0, monthly: 0, streak: 0, totalCards: 0, learningDaysThisMonth: 0 })
      }
    } catch (error) {
      console.error("Error calculating achievements:", error)
      setStats({ daily: 0, weekly: 0, monthly: 0, streak: 0, totalCards: 0, learningDaysThisMonth: 0 })
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    calculateAchievements()
  }, [calculateAchievements])

  return { stats, loading, refetch: calculateAchievements }
}
