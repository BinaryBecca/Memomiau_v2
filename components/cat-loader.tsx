"use client" // Wichtig für Next.js App Router

import Lottie from "lottie-react"
import loadingCat from "@/public/loading-cat.json" // Passe den Pfad an

export default function LoadingCat() {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={loadingCat} loop={true} style={{ width: 200, height: 200 }} />
    </div>
  )
}
