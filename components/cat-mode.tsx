"use client"

import { useState, useEffect, useRef } from "react"
import Lottie from "lottie-react"

interface Cat {
  id: number
  x: number
  y: number
  speed: number
  direction: "left" | "right"
  colliding?: boolean
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
  sharedAnimationData,
  catRefs,
}: {
  cat: Cat
  onClick: (id: number) => void
  onPositionUpdate: (id: number, x: number, y: number) => void
  sharedAnimationData: unknown
  catRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>
}) => {
  const [currentX, setCurrentX] = useState(cat.direction === "left" ? -150 : window.innerWidth + 150)
  const containerRef = useRef<HTMLDivElement>(null)

  // Register this cat's ref in the parent component's catRefs
  useEffect(() => {
    const currentRefs = catRefs.current
    if (containerRef.current) {
      currentRefs[cat.id] = containerRef.current
    }
    return () => {
      delete currentRefs[cat.id]
    }
  }, [cat.id, catRefs])

  useEffect(() => {
    const moveCat = () => {
      setCurrentX((prevX) => {
        const newX =
          cat.direction === "left"
            ? prevX + (window.innerWidth + 300) / (cat.speed * 60) // Move right
            : prevX - (window.innerWidth + 300) / (cat.speed * 60) // Move left

        // Update position for collision detection immediately
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

  if (!sharedAnimationData) {
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
          opacity: cat.colliding ? 0.3 : 1,
          transition: cat.colliding ? "opacity 0.2s ease-in-out" : "none",
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
        opacity: cat.colliding ? 0.3 : 1,
        transition: cat.colliding ? "opacity 0.2s ease-in-out" : "none",
      }}
      onClick={() => onClick(cat.id)}>
      <Lottie animationData={sharedAnimationData} loop={true} autoplay={true} style={{ width: 120, height: 120 }} />
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
  const [sharedAnimationData, setSharedAnimationData] = useState<unknown>(null)
  const catRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // Load shared animation data once
  useEffect(() => {
    fetch("/dance-cat.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log("Dance cat animation loaded successfully")
        setSharedAnimationData(data)
      })
      .catch((error) => {
        console.error("Error loading shared dance-cat.json:", error)
        // Don't set fallback here - let the component handle it
      })
  }, [])

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

    // Double the number of cats (with limit to prevent performance issues)
    setCats((prevCats) => {
      if (prevCats.length >= 15) {
        // Max 15 cats to prevent performance issues
        return prevCats
      }

      const newCats: Cat[] = []
      prevCats.forEach((cat) => {
        // Keep existing cat
        newCats.push(cat)
        // Add a new cat only if under limit
        if (newCats.length < 15) {
          newCats.push({
            id: Date.now() + Math.random(),
            x: -150,
            y: Math.random() * 80 + 10,
            speed: Math.random() * 10 + 10,
            direction: Math.random() > 0.5 ? "left" : "right",
          })
        }
      })
      return newCats.slice(0, 15) // Hard limit to 15 cats
    })
  }

  const updateCatPosition = (id: number, x: number, y: number) => {
    // This function is no longer needed with the new collision detection
    void id
    void x
    void y
  }

  const resetCats = () => {
    setCats([
      {
        id: Date.now(),
        x: -150,
        y: Math.random() * 80 + 10,
        speed: Math.random() * 10 + 10,
        direction: Math.random() > 0.5 ? "left" : "right",
      },
    ])
    setExplosions([])
  }

  // Check for collisions - simplified and direct
  useEffect(() => {
    const checkCollisions = () => {
      if (cats.length < 2) return

      console.log(`🔍 Checking ${cats.length} cats for collisions`)

      // Get current positions directly from DOM elements
      const catPositions: Array<{ id: number; rect: DOMRect }> = []

      cats.forEach((cat) => {
        const ref = catRefs.current[cat.id]
        if (ref) {
          const rect = ref.getBoundingClientRect()
          catPositions.push({ id: cat.id, rect })
        }
      })

      console.log(
        "📍 Current DOM positions:",
        catPositions.map((p) => ({ id: p.id, x: Math.round(p.rect.left), y: Math.round(p.rect.top) }))
      )

      // Check all pairs for collisions
      for (let i = 0; i < catPositions.length; i++) {
        for (let j = i + 1; j < catPositions.length; j++) {
          const cat1 = catPositions[i]
          const cat2 = catPositions[j]

          // Calculate distance between centers
          const center1X = cat1.rect.left + cat1.rect.width / 2
          const center1Y = cat1.rect.top + cat1.rect.height / 2
          const center2X = cat2.rect.left + cat2.rect.width / 2
          const center2Y = cat2.rect.top + cat2.rect.height / 2

          const distance = Math.sqrt(Math.pow(center1X - center2X, 2) + Math.pow(center1Y - center2Y, 2))

          console.log(`📏 Distance between cat ${cat1.id} and cat ${cat2.id}: ${distance.toFixed(1)}px`)

          // If cats are closer than 80px (accounting for 120px width), they collide
          if (distance < 80) {
            console.log("💥 COLLISION DETECTED!", {
              cat1: cat1.id,
              cat2: cat2.id,
              distance: distance.toFixed(1),
              pos1: { x: Math.round(center1X), y: Math.round(center1Y) },
              pos2: { x: Math.round(center2X), y: Math.round(center2Y) },
            })

            // Visual feedback: make cats blink before removing
            setCats((prevCats) =>
              prevCats.map((cat) => (cat.id === cat1.id || cat.id === cat2.id ? { ...cat, colliding: true } : cat))
            )

            // Create explosion and remove cats after short delay
            setTimeout(() => {
              const explosion: Explosion = {
                id: Date.now(),
                x: (center1X + center2X) / 2,
                y: (center1Y + center2Y) / 2,
                timestamp: Date.now(),
              }
              setExplosions((prev) => [...prev, explosion])

              // Remove colliding cats
              setCats((prevCats) => prevCats.filter((cat) => cat.id !== cat1.id && cat.id !== cat2.id))

              // Remove explosion after animation
              setTimeout(() => {
                setExplosions((prev) => prev.filter((exp) => exp.id !== explosion.id))
              }, 2000)
            }, 200) // 200ms delay for blink effect

            return // Exit after first collision to avoid multiple explosions
          }
        }
      }
    }

    const interval = setInterval(checkCollisions, 100) // Check every 100ms
    return () => clearInterval(interval)
  }, [cats]) // Depend on cats to re-run when cats change

  return (
    <div aria-hidden="true">
      {cats.map((cat) => (
        <RunningCat
          key={cat.id}
          cat={cat}
          onClick={handleCatClick}
          onPositionUpdate={updateCatPosition}
          sharedAnimationData={sharedAnimationData}
          catRefs={catRefs}
        />
      ))}
      {explosions.map((explosion) => (
        <Explosion key={explosion.id} explosion={explosion} />
      ))}
      {showClickText && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center">
            <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-xl font-bold mb-4">
              Klicke auf die Katze
            </div>
            {cats.length > 5 && (
              <button
                onClick={resetCats}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold pointer-events-auto">
                Zu viele Katzen? Zurücksetzen ({cats.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
