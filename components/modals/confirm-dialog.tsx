"use client"
import React from "react"
import { X } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

type Props = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = "Bestätigen",
  description,
  confirmLabel = "Ja",
  cancelLabel = "Abbrechen",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onCancel} />
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition">
            <X className="w-5 h-5 text-gray-700 dark:text-white" />
          </button>
        </CardHeader>

        <CardContent>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2  bg-slate-100 dark:bg-slate-700 text-sm">
              {cancelLabel}
            </button>
            <button onClick={onConfirm} className="px-4 py-2 bg-[#f785db] text-white text-sm">
              {confirmLabel}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
