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
      {catMode && <CatMode onGameStarted={() => {}} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-[48px] h-[48px] flex items-center justify-center overflow-hidden">
                <Image
                  src="/memomiau_logo.png"
                  alt="Memomiau-Logo"
                  width={100}
                  height={100}
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-bold text-lg">MemoMiau</span>
            </Link>
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
          <div className="flex items-center space-x-1">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                {mounted && (theme === "dark" ? <Sun className="w-full h-full" /> : <Moon className="w-full h-full" />)}
              </div>
            </button>

            {/* Cat Mode */}
            {user && (
              <div className="flex items-center mr-3 sm:mr-4">
                <button
                  onClick={() => {
                    setCatMode(!catMode)
                  }}
                  className={`p-1 sm:p-2 rounded-lg transition ${
                    catMode ? "bg-pink-200 dark:bg-pink-900" : "hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  title="Cat Mode">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
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
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <Image
                        src="/icon_catmode_paws_white.svg"
                        alt="Cat Mode"
                        width={24}
                        height={24}
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
              <div className="flex space-x-2 ">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 inline-flex items-center justify-center text-xs sm:text-sm px-3 ml-2">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  variant="pink"
                  asChild
                  className="hidden sm:inline-flex h-8 items-center justify-center text-xs sm:text-sm px-3">
                  <Link href="/auth/signup">Jetzt starten</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
