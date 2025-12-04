"use client"

import { useState, useEffect, useRef } from "react"
import Lottie from "lottie-react"

interface Cat {
  id: number
  x: number
  y: number
  speed: number
  direction: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW"
  mode: "entering" | "bouncing"
  colliding?: boolean
  size: number // Size in pixels (width and height)
}

interface Explosion {
  id: number
  x: number
  y: number
  timestamp: number
}

// Helper function to get random cat size
const getRandomCatSize = (): number => {
  // Random size between 80px and 200px for more variety (added 2 larger models)
  return Math.random() * 120 + 80
}

// Helper function to get cat speed based on size (smaller cats are faster)
const getCatSpeed = (size: number): number => {
  // Base speed between 8 and 22, with size influence
  // Smaller cats (80px) get +4 speed bonus, larger cats (160px) get -4 speed penalty
  const sizeBonus = ((160 - size) / 80) * 8 - 4 // -4 to +4 range
  return Math.random() * 10 + 10 + sizeBonus
}

// Helper function to get random direction
const getRandomDirection = (): Cat["direction"] => {
  const directions: Cat["direction"][] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return directions[Math.floor(Math.random() * directions.length)]
}

// Helper function to get random bounce direction based on touched edge
const getRandomBounceDirection = (
  currentDirection: Cat["direction"],
  touchedEdge: "left" | "right" | "top" | "bottom"
): Cat["direction"] => {
  // Get possible directions that would bounce away from the touched edge
  let possibleDirections: Cat["direction"][] = []

  switch (touchedEdge) {
    case "left": // Touched left edge - prefer directions that go right
      possibleDirections = ["E", "NE", "SE"]
      break
    case "right": // Touched right edge - prefer directions that go left
      possibleDirections = ["W", "NW", "SW"]
      break
    case "top": // Touched top edge - prefer directions that go down
      possibleDirections = ["S", "SE", "SW"]
      break
    case "bottom": // Touched bottom edge - prefer directions that go up
      possibleDirections = ["N", "NE", "NW"]
      break
  }

  // If we only have a few options, add some more variety
  if (possibleDirections.length < 5) {
    // Add some diagonal directions that aren't directly opposite
    const allDirections: Cat["direction"][] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    possibleDirections = [...possibleDirections, ...allDirections.filter((d) => !possibleDirections.includes(d))]
  }

  // Remove the current direction to avoid getting stuck
  possibleDirections = possibleDirections.filter((d) => d !== currentDirection)

  return possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
}

// Helper functions for 8-directional movement
const getDirectionConfig = (direction: Cat["direction"]) => {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  switch (direction) {
    case "N": // North - coming from top
      return {
        startX: Math.random() * screenWidth,
        startY: -120,
        deltaX: 0,
        deltaY: 1, // moving down
        resetCondition: (x: number, y: number) => y > screenHeight + 150,
        resetX: Math.random() * screenWidth,
        resetY: -120,
      }
    case "NE": // Northeast - coming from top-right
      return {
        startX: screenWidth + 120,
        startY: -120,
        deltaX: -1, // moving left
        deltaY: 1, // moving down
        resetCondition: (x: number, y: number) => x < -150 || y > screenHeight + 150,
        resetX: screenWidth + 120,
        resetY: -120,
      }
    case "E": // East - coming from right
      return {
        startX: screenWidth + 120,
        startY: Math.random() * screenHeight,
        deltaX: -1, // moving left
        deltaY: 0,
        resetCondition: (x: number, y: number) => {
          void y
          return x < -150
        },
        resetX: screenWidth + 120,
        resetY: Math.random() * screenHeight,
      }
    case "SE": // Southeast - coming from bottom-right
      return {
        startX: screenWidth + 120,
        startY: screenHeight + 120,
        deltaX: -1, // moving left
        deltaY: -1, // moving up
        resetCondition: (x: number, y: number) => x < -150 || y < -150,
        resetX: screenWidth + 120,
        resetY: screenHeight + 120,
      }
    case "S": // South - coming from bottom
      return {
        startX: Math.random() * screenWidth,
        startY: screenHeight + 120,
        deltaX: 0,
        deltaY: -1, // moving up
        resetCondition: (x: number, y: number) => y < -150,
        resetX: Math.random() * screenWidth,
        resetY: screenHeight + 120,
      }
    case "SW": // Southwest - coming from bottom-left
      return {
        startX: -120,
        startY: screenHeight + 120,
        deltaX: 1, // moving right
        deltaY: -1, // moving up
        resetCondition: (x: number, y: number) => x > screenWidth + 150 || y < -150,
        resetX: -120,
        resetY: screenHeight + 120,
      }
    case "W": // West - coming from left
      return {
        startX: -120,
        startY: Math.random() * screenHeight,
        deltaX: 1, // moving right
        deltaY: 0,
        resetCondition: (x: number, y: number) => {
          void y
          return x > screenWidth + 150
        },
        resetX: -120,
        resetY: Math.random() * screenHeight,
      }
    case "NW": // Northwest - coming from top-left
      return {
        startX: -120,
        startY: -120,
        deltaX: 1, // moving right
        deltaY: 1, // moving down
        resetCondition: (x: number, y: number) => x > screenWidth + 150 || y > screenHeight + 150,
        resetX: -120,
        resetY: -120,
      }
  }
}

const RunningCat = ({
  cat,
  onClick,
  onPositionUpdate,
  onModeChange,
  onDirectionChange,
  sharedAnimationData,
  catRefs,
}: {
  cat: Cat
  onClick: (id: number) => void
  onPositionUpdate: (id: number, x: number, y: number) => void
  onModeChange: (id: number, mode: "entering" | "bouncing") => void
  onDirectionChange: (id: number, direction: Cat["direction"]) => void
  sharedAnimationData: unknown
  catRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>
}) => {
  const config = getDirectionConfig(cat.direction)
  const [currentX, setCurrentX] = useState(config.startX)
  const [currentY, setCurrentY] = useState(config.startY)
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
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const moveDistance = (screenWidth + 300) / (cat.speed * 100) // Base movement speed - slightly slower for better control

      setCurrentX((prevX) => {
        let newX = prevX + config.deltaX * moveDistance
        setCurrentY((prevY) => {
          let newY = prevY + config.deltaY * moveDistance

          // Check if cat has entered the screen (for entering mode)
          const isInScreen = newX >= 0 && newX <= screenWidth && newY >= 0 && newY <= screenHeight

          if (cat.mode === "entering" && isInScreen) {
            // Cat has entered the screen, switch to bouncing mode
            setTimeout(() => onModeChange(cat.id, "bouncing"), 0)
          }

          // Handle bouncing off edges (only in bouncing mode)
          if (cat.mode === "bouncing") {
            let bounced = false

            // Clamp X position and reverse direction if needed
            if (newX <= 0) {
              newX = 5
              bounced = true
            } else if (newX >= screenWidth) {
              newX = screenWidth - 5
              bounced = true
            }

            // Clamp Y position and reverse direction if needed
            if (newY <= 0) {
              newY = 5
              bounced = true
            } else if (newY >= screenHeight) {
              newY = screenHeight - 5
              bounced = true
            }

            // If bounced off any edge, get a new random direction
            if (bounced) {
              // Determine which edge was hit based on current position
              let touchedEdge: "left" | "right" | "top" | "bottom" = "left"
              if (newX >= screenWidth - 10) touchedEdge = "right"
              else if (newY <= 10) touchedEdge = "top"
              else if (newY >= screenHeight - 10) touchedEdge = "bottom"

              const newDirection = getRandomBounceDirection(cat.direction, touchedEdge)
              setTimeout(() => onDirectionChange(cat.id, newDirection), 0)
            }
          }

          // Safety net: Reset cat if it goes too far outside screen bounds
          if (config.resetCondition(newX, newY)) {
            newX = config.resetX
            newY = config.resetY
            // Reset to entering mode when respawning
            setTimeout(() => onModeChange(cat.id, "entering"), 0)
          }

          // Update position for collision detection immediately
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            onPositionUpdate(cat.id, rect.left, rect.top)
          }

          return newY
        })
        return newX
      })
    }

    const interval = setInterval(moveCat, 24) // ~40fps on mobile for better performance
    return () => clearInterval(interval)
  }, [cat.id, cat.direction, cat.speed, cat.mode, onPositionUpdate, onModeChange, onDirectionChange, config])

  // Calculate rotation based on direction for visual feedback
  const getRotation = (direction: Cat["direction"]) => {
    switch (direction) {
      case "N":
        return "rotate(0deg)"
      case "NE":
        return "rotate(45deg)"
      case "E":
        return "rotate(90deg)"
      case "SE":
        return "rotate(135deg)"
      case "S":
        return "rotate(180deg)"
      case "SW":
        return "rotate(225deg)"
      case "W":
        return "rotate(270deg)"
      case "NW":
        return "rotate(315deg)"
    }
  }

  if (!sharedAnimationData) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          left: `${currentX}px`,
          top: `${currentY}px`,
          width: `${cat.size}px`,
          height: `${cat.size}px`,
          cursor: "pointer",
          zIndex: 9999,
          transform: getRotation(cat.direction),
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
        top: `${currentY}px`,
        width: `${cat.size}px`,
        height: `${cat.size}px`,
        cursor: "pointer",
        zIndex: 9999,
        transform: getRotation(cat.direction),
        opacity: cat.colliding ? 0.3 : 1,
        transition: cat.colliding ? "opacity 0.2s ease-in-out" : "none",
      }}
      onClick={() => onClick(cat.id)}>
      <Lottie
        animationData={sharedAnimationData}
        loop={true}
        autoplay={true}
        style={{ width: cat.size, height: cat.size }}
      />
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
    const size = getRandomCatSize()
    setCats([
      {
        id: 1,
        x: -150,
        y: Math.random() * 80 + 10,
        speed: getCatSpeed(size),
        direction: getRandomDirection(),
        mode: "entering",
        size: size,
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
      const isMobile = window.innerWidth < 768
      const maxCats = isMobile ? 8 : 15 // Fewer cats on mobile for performance

      if (prevCats.length >= maxCats) {
        // Max cats reached for this device type
        return prevCats
      }

      const newCats: Cat[] = []
      prevCats.forEach((cat) => {
        // Keep existing cat
        newCats.push(cat)
        // Add a new cat only if under limit
        if (newCats.length < (window.innerWidth < 768 ? 8 : 15)) {
          const size = getRandomCatSize()
          newCats.push({
            id: Date.now() + Math.random(),
            x: -150,
            y: Math.random() * 80 + 10,
            speed: getCatSpeed(size),
            direction: getRandomDirection(),
            mode: "entering",
            size: size,
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

  const handleModeChange = (id: number, mode: "entering" | "bouncing") => {
    setCats((prevCats) => prevCats.map((cat) => (cat.id === id ? { ...cat, mode } : cat)))
  }

  const handleDirectionChange = (id: number, direction: Cat["direction"]) => {
    setCats((prevCats) => prevCats.map((cat) => (cat.id === id ? { ...cat, direction } : cat)))
  }

  const resetCats = () => {
    const size = getRandomCatSize()
    setCats([
      {
        id: Date.now(),
        x: -150,
        y: Math.random() * 80 + 10,
        speed: getCatSpeed(size),
        direction: getRandomDirection(),
        mode: "entering",
        size: size,
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

          // Check for collision based on bounding box overlap
          // Two cats collide if their bounding boxes overlap
          const overlapX = Math.abs(center1X - center2X) < (cat1.rect.width + cat2.rect.width) / 2
          const overlapY = Math.abs(center1Y - center2Y) < (cat1.rect.height + cat2.rect.height) / 2

          if (overlapX && overlapY) {
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

    const interval = setInterval(checkCollisions, window.innerWidth < 768 ? 200 : 100) // Check every 200ms on mobile, 100ms on desktop
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
          onModeChange={handleModeChange}
          onDirectionChange={handleDirectionChange}
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
            <div className="bg-violet-500 bg-opacity-90 text-white px-12 py-6 rounded-3xl text-4xl font-bold mb-6 shadow-2xl border-2 border-violet-300 backdrop-blur-sm">
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
