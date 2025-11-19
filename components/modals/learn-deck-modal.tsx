"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X } from "lucide-react"

interface LearnDeckModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
  cardCount: number
}

export const LearnDeckModal = ({ open, onOpenChange, deckId, cardCount }: LearnDeckModalProps) => {
  const router = useRouter()
  const [cardAmount, setCardAmount] = useState("10")
  const [timer, setTimer] = useState("")
  const [statuses, setStatuses] = useState<string[]>([])
  const [isRandom, setIsRandom] = useState(false)
  const [repeatAll, setRepeatAll] = useState(true)

  const handleStart = () => {
    const params = new URLSearchParams()

    if (!repeatAll) {
      params.set("limit", cardAmount)
    }

    if (timer) {
      params.set("timer", timer)
    }

    if (isRandom) {
      params.set("random", "true")
    }

    statuses.forEach(status => {
      params.append("status", status)
    })

    router.push(`/dashboard/deck/${deckId}/learn?${params.toString()}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Lernsitzung starten</CardTitle>
            <CardDescription>Passe deine Lernsitzung an.</CardDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Card Amount */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="random-cards"
                checked={isRandom}
                onCheckedChange={(checked) => setIsRandom(Boolean(checked))}
              />
              <Label htmlFor="random-cards" className="font-normal">Zufällige Karten auswählen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="repeat-all"
                checked={repeatAll}
                onCheckedChange={(checked) => setRepeatAll(Boolean(checked))}
              />
              <Label htmlFor="repeat-all" className="font-normal">Alle Karten wiederholen</Label>
            </div>
            {!repeatAll && (
              <>
                <Label htmlFor="cardAmountInput">Anzahl der Karten</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cardAmountInput"
                    type="number"
                    placeholder="Anzahl"
                    value={cardAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setCardAmount("");
                      } else {
                        const num = parseInt(value, 10);
                        if (!isNaN(num) && num > 0) {
                          setCardAmount(String(Math.min(num, cardCount)));
                        } else {
                          setCardAmount("");
                        }
                      }
                    }}
                    min="1"
                    max={cardCount}
                    className="flex-1"
                  />
                </div>
              </>
            )}
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Nur bestimmte Karten wiederholen</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="status-red" onCheckedChange={(checked) => {
                  if (checked) setStatuses(s => [...s, 'red']);
                  else setStatuses(s => s.filter(st => st !== 'red'));
                }} />
                <Label htmlFor="status-red" className="font-normal text-red-600">Nochmal (Rot)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="status-yellow" onCheckedChange={(checked) => {
                  if (checked) setStatuses(s => [...s, 'yellow']);
                  else setStatuses(s => s.filter(st => st !== 'yellow'));
                }} />
                <Label htmlFor="status-yellow" className="font-normal text-yellow-600">Wiederholen (Gelb)</Label>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-2">
            <Label htmlFor="timer">Timer (in Minuten, optional)</Label>
            <Input
              id="timer"
              type="number"
              placeholder="z.B. 15"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
            />
          </div>

          <Button onClick={handleStart} className="w-full">
            Lernsitzung starten
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
