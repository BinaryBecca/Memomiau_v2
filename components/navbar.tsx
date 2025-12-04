"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { NAVIGATION_ITEMS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { CatMode } from "./cat-mode"
import { useRouter } from "next/navigation"

export const Navbar = () => {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [catMode, setCatMode] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Preload heavy routes on hover for better UX
  const preloadRoute = (href: string) => {
    router.prefetch(href)
  }

  const getAvatarInitial = () => {
    return profile?.username.charAt(0).toUpperCase() || "U"
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white dark:bg-slate-950 dark:border-slate-800">
      {catMode && <CatMode onGameStarted={() => setGameStarted(true)} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <Image
                src="/memomiau_dummy.jpg"
                alt="Memomiau-Logo"
                width={100}
                height={100}
                className="rounded-full"
                sizes="32px"
              />
            </div>
            <span className="font-bold text-lg">MemoMiau</span>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden lg:flex space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => preloadRoute(item.href)}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side: Theme, Cat Mode, Auth */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                ))}
            </button>

            {/* Cat Mode */}
            {user && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCatMode(!catMode)
                    if (catMode) {
                      // Reset game started when turning off cat mode
                      setGameStarted(false)
                    }
                  }}
                  className={`p-1 sm:p-2 rounded-lg transition ${
                    catMode ? "bg-pink-200 dark:bg-pink-900" : "hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  title="Cat Mode">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center">
                    {mounted ? (
                      <Image
                        src={
                          catMode
                            ? "/icon_catmode_paws_pink.svg"
                            : theme === "dark"
                            ? "/icon_catmode_paws_white.svg"
                            : "/icon_catmode_paws_black.svg"
                        }
                        alt="Cat Mode"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    ) : (
                      <Image
                        src="/icon_catmode_paws_white.svg"
                        alt="Cat Mode"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    )}
                  </div>
                </button>
              </div>
            )}

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
                <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900">
                  {/* Mobile Navigation Links */}
                  <div className="block lg:hidden">
                    {NAVIGATION_ITEMS.map((item) => (
                      <DropdownMenuItem asChild key={item.href}>
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:block text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
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
