"use client"

import { useState, useEffect } from "react"

const RunningCat = ({ onAnimationEnd }: { onAnimationEnd: () => void }) => {
  const [yPosition, setYPosition] = useState(0)
  const [isRtl, setIsRtl] = useState(false)
  const [speed, setSpeed] = useState(10)

  useEffect(() => {
    setYPosition(Math.random() * 80 + 10) // Random vertical position from 10% to 90%
    setIsRtl(Math.random() > 0.5)
    setSpeed(Math.random() * 5 + 5) // Random duration between 5 and 10 seconds
  }, [])

  return (
    <div
      className={`running-cat ${isRtl ? "rtl" : ""}`}
      style={{ top: `${yPosition}vh`, animationDuration: `${speed}s` }}
      onAnimationEnd={onAnimationEnd}>
      <span style={{ fontSize: "50px" }}>🐈</span>
    </div>
  )
}

export const CatMode = () => {
  const [cats, setCats] = useState<number[]>([])

  useEffect(() => {
    document.body.classList.add("cat-mode-background")

    const interval = setInterval(() => {
      setCats((prev) => [...prev, Date.now()])
    }, 3000) // A cat every 3 seconds

    return () => {
      document.body.classList.remove("cat-mode-background")
      clearInterval(interval)
    }
  }, [])

  const removeCat = (id: number) => {
    setCats((prev) => prev.filter((catId) => catId !== id))
  }

  return (
    <div aria-hidden="true">
      {cats.map((id) => (
        <RunningCat key={id} onAnimationEnd={() => removeCat(id)} />
      ))}
    </div>
  )
}
