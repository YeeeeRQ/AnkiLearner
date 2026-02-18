import { motion, MotionValue } from 'framer-motion'
import { SpeakerWaveIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import { type Card } from '../../db'
import { DebugOverlay } from './DragVisuals'
import { getSkinForCard, type CardSkin } from './CardSkins'
import { useMemo, useState, useEffect, useRef, memo } from 'react'
import { useFlipSound } from '../../hooks/useFlipSound'

interface FlashCardProps {
  currentCard: Card
  isFlipped: boolean
  isDebug: boolean
  speak: (text: string) => void
  dragValues: {
    x: MotionValue<number>
    y: MotionValue<number>
    rotate: MotionValue<number>
    opacity: MotionValue<number>
  }
  dragHandlers: {
    onDrag: (event: any, info: any) => void
    onDragEnd: () => void
  }
  width?: number | string
  height?: number | string
  className?: string
  enableDrag?: boolean
}

export const cardDimensions = {
  width: '85vw',
  maxWidth: '320px',
  height: '65vh',
  maxHeight: '480px'
}

export const FlashCard = memo(function FlashCard({ currentCard, isFlipped, isDebug, speak, dragValues, dragHandlers, width, height, className, enableDrag = true, onFlip }: FlashCardProps & { onFlip?: () => void }) {
  const { x, y, rotate, opacity } = dragValues
  
  // Randomly select a skin based on currentCard.id to ensure persistence during flip/re-render
  // but randomness across different cards
  const skin = useMemo(() => getSkinForCard(currentCard.id), [currentCard.id]);

  // Phonetic state
  const [phonetic, setPhonetic] = useState<string | undefined>(currentCard.phonetic);

  // Flip sound effect
  const playFlipSound = useFlipSound()
  const prevIsFlipped = useRef(isFlipped)
  const prevCardId = useRef(currentCard.id)

  useEffect(() => {
    // Skip sound if card changed
    if (prevCardId.current !== currentCard.id) {
      prevCardId.current = currentCard.id
      prevIsFlipped.current = isFlipped
      return
    }

    // Play sound if flip state changed
    if (prevIsFlipped.current !== isFlipped) {
      playFlipSound()
      prevIsFlipped.current = isFlipped
    }
  }, [isFlipped, currentCard.id, playFlipSound])

  useEffect(() => {
    setPhonetic(currentCard.phonetic);
    if (!currentCard.phonetic && currentCard.front) {
      import('../../utils/phoneticFetcher').then(({ fetchPhoneticForCard }) => {
        fetchPhoneticForCard(currentCard).then(text => {
          if (text) setPhonetic(text);
        });
      });
    }
  }, [currentCard]);

  return (
    <div 
      className={`z-10 relative touch-none select-none ${className || ''}`}
      style={{
        width: width ?? cardDimensions.width,
        height: height ?? cardDimensions.height,
        maxWidth: !width ? cardDimensions.maxWidth : undefined,
        maxHeight: !height ? cardDimensions.maxHeight : undefined
      }}
    >
      <motion.div 
        className="w-full h-full touch-none focus:outline-none relative"
        key={currentCard.id}
        style={{ x, y, rotate, opacity }}
        drag={enableDrag}
        dragConstraints={{ left: -3000, right: 3000, top: -3000, bottom: 3000 }}
        dragSnapToOrigin
        dragElastic={1}
        dragMomentum={false}
        onDrag={dragHandlers.onDrag}
        onDragEnd={dragHandlers.onDragEnd}
        whileTap={{ cursor: "grabbing" }}
      >
        <DebugOverlay isDebug={isDebug} />
        
        {/* Floating Wrapper with Perspective */}
        <motion.div
          className="w-full h-full relative"
          style={{ perspective: 1000 }}
          animate={{ y: [0, -15, 0] }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* 3D Flip Container */}
          <motion.div
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Front Face */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                zIndex: isFlipped ? 0 : 1,
                pointerEvents: isFlipped ? 'none' : 'auto'
              }}
            >
              <CardSide currentCard={currentCard} speak={speak} isBack={false} skin={skin} phonetic={phonetic} onFlip={onFlip} />
            </div>

            {/* Back Face */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)',
                zIndex: isFlipped ? 1 : 0,
                pointerEvents: isFlipped ? 'auto' : 'none'
              }}
            >
              <CardSide currentCard={currentCard} speak={speak} isBack={true} skin={skin} phonetic={phonetic} onFlip={onFlip} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
})

function AutoResizeText({ text, className, maxFontSize = 48, minFontSize = 16 }: { text: string, className?: string, maxFontSize?: number, minFontSize?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState(maxFontSize)

  useEffect(() => {
    const container = containerRef.current
    const textElement = textRef.current
    if (!container || !textElement) return

    const checkOverflow = () => {
      // Start from maxFontSize
      let low = minFontSize
      let high = maxFontSize
      let bestSize = minFontSize
      
      // Calculate max width allowed (100% of container)
      const maxWidth = container.offsetWidth

      // Binary search for optimal size
      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        textElement.style.fontSize = `${mid}px`
        
        // Use scrollWidth to detect if text overflows container width
        // Use a small buffer (e.g. 4px) to prevent edge case jitter
        if (textElement.scrollWidth <= maxWidth) {
          bestSize = mid
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
      
      setFontSize(bestSize)
      // Reset to best size for display
      textElement.style.fontSize = `${bestSize}px`
    }

    checkOverflow()
    
    // Optional: Re-check on window resize with debounce
    let timeoutId: any
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkOverflow, 100)
    })
    resizeObserver.observe(container)
    
    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeoutId)
    }
  }, [text, maxFontSize, minFontSize])

  return (
    <div ref={containerRef} className={`w-full flex justify-center overflow-hidden ${className}`}>
      <span 
        ref={textRef} 
        style={{ fontSize: `${fontSize}px`, whiteSpace: 'nowrap', display: 'inline-block' }}
        // Removed transition-all to prevent animation loop interference with measurement
        // Removed duration-200 to eliminate any potential layout shift animation
      >
        {text}
      </span>
    </div>
  )
}

function CardSide({ currentCard, speak, isBack, skin, phonetic, onFlip }: { currentCard: Card, speak: (text: string) => void, isBack: boolean, skin: CardSkin, phonetic?: string, onFlip?: () => void }) {
  return (
    <div className={`w-full h-full rounded-3xl shadow-lg border flex flex-col overflow-hidden relative ${skin.bgClass} ${skin.borderClass}`}>
      
      {/* SVG Background Decorations */}
      <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${skin.textClass}`}>
        {skin.renderDecorations(isBack)}
      </div>

      {/* Card Header Label */}
      <div className={`absolute top-6 right-6 text-xs font-mono font-bold tracking-[0.2em] uppercase opacity-40 z-20 ${skin.textClass}`}>
        {isBack ? 'ANSWER' : 'QUESTION'}
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 z-10 ${skin.textClass} w-full`}>
        {/* Primary Text (Word/Question) */}
        <div className="space-y-4 w-full flex flex-col items-center">
          <AutoResizeText 
            text={currentCard.front} 
            className="font-bold tracking-tight leading-tight"
            maxFontSize={48}
            minFontSize={20}
          />

          {/* Phonetic Symbol */}
          {phonetic && (
            <div className="text-xl font-mono opacity-80">
              {phonetic}
            </div>
          )}
          
          {/* Pronunciation / Audio Button */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              console.log('Play audio clicked:', currentCard.front);
              speak(currentCard.front); 
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className={`relative z-50 inline-flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm cursor-pointer ${skin.textClass}`}
            title="Play Audio"
          >
            <SpeakerWaveIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Divider for Back Side */}
        {isBack && (
          <div className={`w-16 h-1 rounded-full my-2 bg-current opacity-20`}></div>
        )}

        {/* Secondary Text (Definition/Answer) - Only shown on back */}
        {isBack && (
          <div className="space-y-3 w-full animate-fadeIn">
            <p className="text-xl font-medium leading-relaxed opacity-90">
              {currentCard.back}
            </p>
          </div>
        )}
      </div>

      {/* Flip Button at Bottom Center */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50">
         <button
          onClick={(e) => {
            e.stopPropagation();
            onFlip?.();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm cursor-pointer ${skin.textClass}`}
        >
          <ArrowsRightLeftIcon className="w-4 h-4" />
          <span className="text-sm font-medium">翻转</span>
        </button>
      </div>

      {/* Card Footer Gradient Bar (Optional, keeping consistent with skin) */}
      <div className={`h-2 w-full opacity-50 bg-gradient-to-r from-transparent via-current to-transparent ${skin.textClass}`}></div>
    </div>
  )
}
