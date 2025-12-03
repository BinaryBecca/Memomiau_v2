"use client"

import { useState, useEffect } from "react"
import Lottie from "lottie-react"

const RunningCat = ({ onAnimationEnd }: { onAnimationEnd: () => void }) => {
  const [yPosition, setYPosition] = useState(0)
  const [isRtl, setIsRtl] = useState(false)
  const [speed, setSpeed] = useState(10)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    setYPosition(Math.random() * 80 + 10) // Random vertical position from 10% to 90%
    setIsRtl(Math.random() > 0.5)
    setSpeed(Math.random() * 10 + 10) // Random duration between 10 and 20 seconds

    // Load dance-cat.json (Lottie animation)
    fetch('/dance-cat.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data)
      })
      .catch(error => {
        console.error('Error loading dance-cat.json:', error)
      })
  }, [])

  if (!animationData) {
    return (
      <div
        className={`running-cat ${isRtl ? "rtl" : ""}`}
        style={{ top: `${yPosition}vh`, animationDuration: `${speed}s` }}
        onAnimationEnd={onAnimationEnd}>
        <span style={{ fontSize: "50px" }}>🐈</span>
      </div>
    ) // Fallback to emoji if animation not loaded
  }

  return (
    <div
      className={`running-cat ${isRtl ? "rtl" : ""}`}
      style={{ top: `${yPosition}vh`, animationDuration: `${speed}s` }}
      onAnimationEnd={onAnimationEnd}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: 120, height: 120 }}
      />
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
