"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CompletionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
  completedCount: number
  onRepeat: () => void
}

export default function CompletionModal({
  open,
  onOpenChange,
  deckId,
  completedCount,
  onRepeat,
}: CompletionModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 text-center">
          <div className="w-full mb-4 max-w-[520px] mx-auto">
            <Image
              src="/memomiau_hero.png"
              alt="Memomiau Hero"
              width={520}
              height={312}
              sizes="(max-width: 640px) 320px, 520px"
              className="w-full h-auto mx-auto rounded-md object-cover"
              priority
            />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Herzlichen Glückwunsch!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Du hast {completedCount} Karten gelernt!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="w-full sm:w-auto" variant="outline">
              <Link href={`/dashboard/deck/${deckId}`}>Zurück zum Deck</Link>
            </Button>
            <Button onClick={onRepeat} variant="pink" className="w-full sm:w-auto">
              Nochmal lernen
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
