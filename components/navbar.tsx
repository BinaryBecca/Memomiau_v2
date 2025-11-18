"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { NAVIGATION_ITEMS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

export const Navbar = () => {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [catMode, setCatMode] = useState(false)

  const getAvatarInitial = () => {
    return profile?.username.charAt(0).toUpperCase() || "U"
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <Image src="/memomiau_dummy.jpg" alt="Memomiau-Logo" width={100} height={100} className="rounded-full" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">MemoMiau</span>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side: Theme, Cat Mode, Auth */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cat Mode */}
            <button
              onClick={() => setCatMode(!catMode)}
              className={`p-2 rounded-lg transition ${
                catMode ? "bg-pink-200 dark:bg-pink-900" : "hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
              title="Cat Mode">
              🐾
            </button>

            {/* Auth Buttons / User Menu */}
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback>{getAvatarInitial()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
