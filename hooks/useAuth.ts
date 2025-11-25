"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AuthUser, Profile } from "@/lib/types"

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user as AuthUser | null)

        if (user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          setProfile(profileData as Profile)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user as AuthUser)

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData as Profile)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [supabase])

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string,
    presetAvatar: string | null,
    avatarUrl: string | null
  ) => {
    try {
      console.log("Starting signup with:", { email, firstName, lastName, username })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, // Redirect after email confirmation
          data: {
            first_name: firstName,
            last_name: lastName,
            username,
          },
        },
      })

      console.log("Auth signup response:", { data, error })

      if (error) {
        console.error("Auth signup error:", error)
        throw error
      }

      if (data.user) {
        console.log("Profile created automatically by trigger for user:", data.user.id)

        // Update the profile with additional data (username, avatar, etc.)
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
            username,
            preset_avatar: presetAvatar,
            avatar_url: avatarUrl,
          })
          .eq("id", data.user.id)

        if (updateError) {
          console.error("Profile update error:", updateError)
          throw updateError
        }

        console.log("Profile updated successfully for user:", data.user.id)

        // Debugging: Check session status
        const sessionCheck = await supabase.auth.getSession()
        console.log("Session status after signup:", sessionCheck)

        if (!sessionCheck.data.session) {
          console.warn("No active session found after signup. User may need to log in manually.")
        } else {
          console.log("Active session found:", sessionCheck.data.session)
        }

        // Check if the session exists or re-authenticate
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          console.log("No active session found. Attempting to re-authenticate user...")

          // Wait for email confirmation and re-authenticate
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            console.error("Re-authentication error:", signInError)
            throw signInError
          }

          console.log("User successfully re-authenticated after email confirmation.")
        }

        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/dashboard")
    } catch (error) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }
}
