import { motion, MotionValue } from 'framer-motion'
import { SpeakerWaveIcon } from '@heroicons/react/24/outline'
import { type Card } from '../../db'
import { DebugOverlay } from './DragVisuals'
import { getSkinForCard, type CardSkin } from './CardSkins'
import { useMemo, useState, useEffect, useRef } from 'react'
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

export function FlashCard({ currentCard, isFlipped, isDebug, speak, dragValues, dragHandlers, width, height, className, enableDrag = true }: FlashCardProps) {
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
        drag
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
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <CardSide currentCard={currentCard} speak={speak} isBack={false} skin={skin} phonetic={phonetic} />
            </div>

            {/* Back Face */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <CardSide currentCard={currentCard} speak={speak} isBack={true} skin={skin} phonetic={phonetic} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function CardSide({ currentCard, speak, isBack, skin, phonetic }: { currentCard: Card, speak: (text: string) => void, isBack: boolean, skin: CardSkin, phonetic?: string }) {
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
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 z-10 ${skin.textClass}`}>
        {/* Primary Text (Word/Question) */}
        <div className="space-y-4 w-full">
          <h2 className="text-4xl font-bold tracking-tight leading-tight break-words">
            {currentCard.front}
          </h2>

          {/* Phonetic Symbol */}
          {phonetic && (
            <div className="text-xl font-mono opacity-80">
              {phonetic}
            </div>
          )}
          
          {/* Pronunciation / Audio Button */}
          {!isBack && (
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
          )}
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

      {/* Card Footer Gradient Bar (Optional, keeping consistent with skin) */}
      <div className={`h-2 w-full opacity-50 bg-gradient-to-r from-transparent via-current to-transparent ${skin.textClass}`}></div>
    </div>
  )
}
