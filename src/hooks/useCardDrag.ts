import { useState, useEffect, useCallback } from 'react'
import { useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { useFocusSound } from './useFocusSound'

export function useCardDrag(handleRate: (rating: 1 | 2 | 3 | 4) => void) {
  const [isDebug, setIsDebug] = useState(false)
  const [debugStatus, setDebugStatus] = useState("")
  const [highlightedRating, setHighlightedRating] = useState<1 | 2 | 3 | 4 | null>(null)
  const [dragPath, setDragPath] = useState<{ start: {x: number, y: number}, current: {x: number, y: number} } | null>(null)
  
  // Sound effect for rating selection
  const playFocusSound = useFocusSound()

  useEffect(() => {
    if (highlightedRating !== null) {
      playFocusSound()
    }
  }, [highlightedRating, playFocusSound])

  // Framer Motion values for swipe
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-20, 20])
  const opacity = useTransform(y, [0, 300], [1, 0.5])

  const handleDrag = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Calculate swipe state
    const screenHeight = window.innerHeight
    const cardCenterY = screenHeight * 0.4 // Based on top-[40%]

    const startX = info.point.x - info.offset.x
    const startY = info.point.y - info.offset.y

    const isUpperHalf = startY < cardCenterY
    const verticalState = isUpperHalf ? "Upper Half" : "Lower Half"

    const { x, y } = info.offset
    const absX = Math.abs(x)
    const absY = Math.abs(y)
    
    let directionState = ""
    let currentRating: 1 | 2 | 3 | 4 | null = null
    
    // Check if drag pointer overlaps with any rating button
    const pointerX = info.point.x
    const pointerY = info.point.y
    
    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById(`rating-btn-${i}`)
      if (btn) {
        const rect = btn.getBoundingClientRect()
        if (pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom) {
          currentRating = i as 1 | 2 | 3 | 4
          directionState = "Hovering Button"
          break
        }
      }
    }

    // If no button overlap, fall back to directional logic
    if (!currentRating) {
      const moveThreshold = 10
      const cancelThreshold = 60 // Must match CANCEL_RADIUS in DragVisuals
      const distance = Math.sqrt(x * x + y * y)

      if (distance < cancelThreshold) {
        directionState = "Cancelled"
        currentRating = null
      } else if (absX < moveThreshold && absY < moveThreshold) {
        directionState = "No Movement"
      } else {
        if (absX > absY) {
          directionState = x > 0 ? "Right" : "Left"
        } else {
          directionState = y > 0 ? "Down" : "Up"
        }

        const ratio = Math.min(absX, absY) / Math.max(absX, absY)
        if (ratio > 0.5) {
           if (x > 0 && y > 0) {
             directionState = "Down-Right"
             currentRating = 4 // Easy
           }
           if (x > 0 && y < 0) {
             directionState = "Up-Right"
             currentRating = 3 // Good
           }
           if (x < 0 && y > 0) {
             directionState = "Down-Left"
             currentRating = 1 // Retry
           }
           if (x < 0 && y < 0) {
             directionState = "Up-Left"
             currentRating = 2 // Hard
           }
        }
      }
    }

    // Only update state if values have changed to prevent excessive re-renders
    if (currentRating !== highlightedRating) {
      setHighlightedRating(currentRating)
    }
    
    // Throttle drag path updates for performance if needed, but for now just direct update
    // We could check if distance change is significant enough
    setDragPath({
      start: { x: startX, y: startY },
      current: { x: info.point.x, y: info.point.y }
    })
    
    if (isDebug) {
      setDebugStatus(`Swipe State: [${verticalState}] | [${directionState}]`)
    }
  }, [highlightedRating, isDebug])

  const handleDragEnd = useCallback(() => {
    // Execute rating logic if a rating is highlighted
    if (highlightedRating) {
      // Small delay to allow UI to settle before next card logic which might be heavy
      requestAnimationFrame(() => {
        handleRate(highlightedRating)
      })
    }

    // Reset or handle end of drag if needed
    setDebugStatus("")
    setHighlightedRating(null)
    setDragPath(null)
  }, [highlightedRating, handleRate])

  return {
    x, y, rotate, opacity,
    isDebug, setIsDebug,
    debugStatus,
    highlightedRating,
    dragPath,
    handleDrag,
    handleDragEnd
  }
}
