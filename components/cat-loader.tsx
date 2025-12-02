"use client"

import Lottie from "lottie-react"
import loadingCat from "@/public/loading-cat.json"

export default function LoadingCat() {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={loadingCat} loop={true} className="w-40 h-40" />
    </div>
  )
}
