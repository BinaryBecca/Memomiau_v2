"use client"

import { useState, useEffect, useRef } from "react"
import Lottie from "lottie-react"

interface Cat {
  id: number
  x: number
  y: number
  speed: number
  direction: "left" | "right"
}

interface Explosion {
  id: number
  x: number
  y: number
  timestamp: number
}

const RunningCat = ({
  cat,
  onClick,
  onPositionUpdate,
}: {
  cat: Cat
  onClick: (id: number) => void
  onPositionUpdate: (id: number, x: number, y: number) => void
}) => {
  const [animationData, setAnimationData] = useState<unknown>(null)
  const [currentX, setCurrentX] = useState(cat.direction === "left" ? -150 : window.innerWidth + 150)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load dance-cat.json (Lottie animation)
    fetch("/dance-cat.json")
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data)
      })
      .catch((error) => {
        console.error("Error loading dance-cat.json:", error)
      })
  }, [])

  useEffect(() => {
    const moveCat = () => {
      setCurrentX((prevX) => {
        const newX =
          cat.direction === "left"
            ? prevX + (window.innerWidth + 300) / (cat.speed * 60) // Move right
            : prevX - (window.innerWidth + 300) / (cat.speed * 60) // Move left

        // Update position for collision detection
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          onPositionUpdate(cat.id, rect.left, rect.top)
        }

        // Reset position when off-screen
        if (
          (cat.direction === "left" && newX > window.innerWidth + 150) ||
          (cat.direction === "right" && newX < -150)
        ) {
          return cat.direction === "left" ? -150 : window.innerWidth + 150
        }

        return newX
      })
    }

    const interval = setInterval(moveCat, 16) // ~60fps
    return () => clearInterval(interval)
  }, [cat.id, cat.direction, cat.speed, onPositionUpdate])

  if (!animationData) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          left: `${currentX}px`,
          top: `${cat.y}vh`,
          width: "120px",
          height: "120px",
          cursor: "pointer",
          zIndex: 9999,
          transform: cat.direction === "right" ? "scaleX(-1)" : "none",
        }}
        onClick={() => onClick(cat.id)}>
        <span style={{ fontSize: "50px" }}>🐈</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: `${currentX}px`,
        top: `${cat.y}vh`,
        width: "120px",
        height: "120px",
        cursor: "pointer",
        zIndex: 9999,
        transform: cat.direction === "right" ? "scaleX(-1)" : "none",
      }}
      onClick={() => onClick(cat.id)}>
      <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: 120, height: 120 }} />
    </div>
  )
}

const Explosion = ({ explosion }: { explosion: Explosion }) => {
  const [animationData, setAnimationData] = useState<unknown>(null)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    fetch("/cat-explosion.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Explosion animation loaded successfully")
        setAnimationData(data)
      })
      .catch((error) => {
        console.error("Error loading cat-explosion.json:", error)
        setShowFallback(true)
      })
  }, [])

  if (showFallback) {
    return (
      <div
        style={{
          position: "fixed",
          left: `${explosion.x}px`,
          top: `${explosion.y}px`,
          zIndex: 10000,
          pointerEvents: "none",
          fontSize: "100px",
          animation: "explode 0.5s ease-out forwards",
        }}>
        💥
      </div>
    )
  }

  if (!animationData) return null

  return (
    <div
      style={{
        position: "fixed",
        left: `${explosion.x}px`,
        top: `${explosion.y}px`,
        zIndex: 10000,
        pointerEvents: "none",
      }}>
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay={true}
        style={{ width: 200, height: 200 }}
        onComplete={() => console.log("Explosion animation completed")}
      />
    </div>
  )
}

export const CatMode = () => {
  const [cats, setCats] = useState<Cat[]>([])
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [showClickText, setShowClickText] = useState(true)
  const catPositions = useRef<Record<number, { x: number; y: number }>>({})

  // Initialize with one cat
  useEffect(() => {
    setCats([
      {
        id: 1,
        x: -150,
        y: Math.random() * 80 + 10,
        speed: Math.random() * 10 + 10,
        direction: Math.random() > 0.5 ? "left" : "right",
      },
    ])
  }, [])

  const handleCatClick = (_catId: number) => {
    // Parameter wird derzeit nicht verwendet, aber für zukünftige Features reserviert
    void _catId
    if (showClickText) {
      setShowClickText(false)
    }

    // Double the number of cats
    setCats((prevCats) => {
      const newCats: Cat[] = []
      prevCats.forEach((cat) => {
        // Keep existing cat
        newCats.push(cat)
        // Add a new cat
        newCats.push({
          id: Date.now() + Math.random(),
          x: -150,
          y: Math.random() * 80 + 10,
          speed: Math.random() * 10 + 10,
          direction: Math.random() > 0.5 ? "left" : "right",
        })
      })
      return newCats
    })
  }

  const updateCatPosition = (id: number, x: number, y: number) => {
    catPositions.current[id] = { x, y }
  }

  // Check for collisions (20% overlap threshold)
  useEffect(() => {
    const checkCollisions = () => {
      const catIds = Object.keys(catPositions.current)
      const catWidth = 120
      const catHeight = 120
      const overlapThreshold = 0.2 // 20% overlap

      for (let i = 0; i < catIds.length; i++) {
        for (let j = i + 1; j < catIds.length; j++) {
          const pos1 = catPositions.current[parseInt(catIds[i])]
          const pos2 = catPositions.current[parseInt(catIds[j])]

          if (pos1 && pos2) {
            // Calculate overlap area
            const xOverlap = Math.max(0, Math.min(pos1.x + catWidth, pos2.x + catWidth) - Math.max(pos1.x, pos2.x))
            const yOverlap = Math.max(0, Math.min(pos1.y + catHeight, pos2.y + catHeight) - Math.max(pos1.y, pos2.y))
            const overlapArea = xOverlap * yOverlap
            const catArea = catWidth * catHeight
            const overlapPercentage = overlapArea / catArea

            if (overlapPercentage >= overlapThreshold) {
              // 20% overlap detected
              // Create explosion
              const explosion: Explosion = {
                id: Date.now(),
                x: (pos1.x + pos2.x) / 2 + catWidth / 2,
                y: (pos1.y + pos2.y) / 2 + catHeight / 2,
                timestamp: Date.now(),
              }
              setExplosions((prev) => [...prev, explosion])

              // Remove colliding cats after 3 seconds
              setTimeout(() => {
                setCats((prevCats) =>
                  prevCats.filter((cat) => cat.id !== parseInt(catIds[i]) && cat.id !== parseInt(catIds[j]))
                )
                setExplosions((prev) => prev.filter((exp) => exp.id !== explosion.id))
              }, 3000)
            }
          }
        }
      }
    }

    const interval = setInterval(checkCollisions, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div aria-hidden="true">
      {cats.map((cat) => (
        <RunningCat key={cat.id} cat={cat} onClick={handleCatClick} onPositionUpdate={updateCatPosition} />
      ))}
      {explosions.map((explosion) => (
        <Explosion key={explosion.id} explosion={explosion} />
      ))}
      {showClickText && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-xl font-bold">
            Klicke auf die Katze
          </div>
        </div>
      )}
    </div>
  )
}
