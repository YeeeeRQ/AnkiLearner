import { Link } from 'react-router-dom'
import AlertDialog from '../components/AlertDialog'
import { useStudySession } from '../hooks/useStudySession'
import { useCardDrag } from '../hooks/useCardDrag'
import { StudyHeader } from '../components/study/StudyHeader'
import { StudyControls } from '../components/study/StudyControls'
import { FlashCard, cardDimensions } from '../components/study/FlashCard'
import { DragPathVisual } from '../components/study/DragVisuals'
import { getSkinForCard } from '../components/study/CardSkins'
import { StudyTutorial } from '../components/study/StudyTutorial'
import { useRef, useState, useLayoutEffect } from 'react'

export default function Study() {
  const {
    queue,
    currentCard,
    isFlipped,
    setIsFlipped,
    loading,
    history,
    showComplete,
    handleRate,
    speak,
    navigate,
    autoPlayAudio,
    setAutoPlayAudio
  } = useStudySession()

  const {
    x, y, rotate, opacity,
    isDebug,
    debugStatus,
    highlightedRating,
    dragPath,
    handleDrag,
    handleDragEnd
  } = useCardDrag(handleRate)

  // Adaptive card sizing
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardSize, setCardSize] = useState({ width: 320, height: 480 })

  useLayoutEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      
      // Target Aspect Ratio: 2:3 (320x480)
      const aspectRatio = 320 / 480
      const maxWidth = 320
      const maxHeight = 480
      
      // Margins
      const marginX = 32
      const marginY = 24
      
      const availableWidth = Math.min(width - marginX, maxWidth)
      const availableHeight = Math.min(height - marginY, maxHeight)
      
      let w = availableWidth
      let h = w / aspectRatio
      
      if (h > availableHeight) {
        h = availableHeight
        w = h * aspectRatio
      }
      
      setCardSize({ width: w, height: h })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  if (loading) return <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">加载中...</div>

  if (!currentCard && !showComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-2xl font-bold text-green-500 dark:text-green-400">今日任务已完成！</div>
        <div className="text-neutral-500 dark:text-neutral-400">该牌组暂时没有需要复习的卡片。</div>
        <Link to="/" className="bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700 transition">
          返回首页
        </Link>
      </div>
    )
  }

  // Handle completion state properly even if currentCard is null
  if (showComplete) {
    return (
      <>
        <AlertDialog
          isOpen={showComplete}
          onClose={() => navigate('/')}
          title="恭喜！"
          message="你已完成今日的复习任务。"
          type="success"
          confirmText="返回首页"
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-2xl font-bold text-green-500 dark:text-green-400">今日任务已完成！</div>
        </div>
      </>
    )
  }

  if (!currentCard) return null // Should be handled by loading or completion state

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden overscroll-none flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Drag Path Visualization */}
      <DragPathVisual dragPath={dragPath} />

      {/* Tutorial Overlay */}
      <StudyTutorial />

      {/* Header Spacer - reserves space for the absolute header */}
      <div className="flex-none h-16 relative z-50 pointer-events-none">
        <StudyHeader 
          queueLength={queue.length}
          currentCard={currentCard}
          isDebug={isDebug}
          debugStatus={debugStatus}
          onBack={() => navigate(-1)}
          autoPlayAudio={autoPlayAudio}
          onToggleAutoPlay={() => setAutoPlayAudio(!autoPlayAudio)}
        />
      </div>

      {/* Main Content Area - Flexible */}
      <div ref={containerRef} className="flex-1 w-full relative flex items-center justify-center min-h-0">
        
        {/* Previous Card (Left) */}
        {history.length > 0 && (() => {
          const prevCard = history[history.length - 1];
          const prevSkin = getSkinForCard(prevCard.id);
          return (
            <div 
              className="absolute left-1/2 top-1/2 opacity-60 pointer-events-none select-none z-0"
              style={{
                width: cardSize.width,
                height: cardSize.height,
                transform: 'translate(-50%, -50%) translateX(-120%) rotate(-6deg) scale(0.9)'
              }}
            >
              <div className={`w-full h-full rounded-3xl shadow-lg border flex flex-col items-center justify-center p-8 text-center ${prevSkin.bgClass} ${prevSkin.borderClass}`}>
                 <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${prevSkin.textClass} opacity-30`}>
                    {prevSkin.renderDecorations(false)}
                 </div>
                 <div className={`text-2xl font-medium mb-4 line-clamp-3 z-10 ${prevSkin.textClass}`}>
                   {prevCard.front}
                 </div>
                 <div className={`text-sm z-10 ${prevSkin.textClass} opacity-60`}>Previous</div>
               </div>
            </div>
          )
        })()}

        {/* Next Card (Right) */}
        {queue.length > 1 && (() => {
          const nextCard = queue[1];
          const nextSkin = getSkinForCard(nextCard.id);
          return (
            <div 
              className="absolute left-1/2 top-1/2 opacity-60 pointer-events-none select-none z-0"
              style={{
                width: cardSize.width,
                height: cardSize.height,
                transform: 'translate(-50%, -50%) translateX(120%) rotate(6deg) scale(0.9)'
              }}
            >
              <div className={`w-full h-full rounded-3xl shadow-lg border flex flex-col items-center justify-center p-8 text-center ${nextSkin.bgClass} ${nextSkin.borderClass}`}>
                <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${nextSkin.textClass} opacity-30`}>
                   {nextSkin.renderDecorations(false)}
                </div>
                <div className={`text-2xl font-medium mb-4 line-clamp-3 z-10 ${nextSkin.textClass}`}>
                  {nextCard.front}
                </div>
                <div className={`text-sm z-10 ${nextSkin.textClass} opacity-60`}>Next</div>
              </div>
            </div>
          )
        })()}

        {/* Current Interactive Card */}
        <FlashCard
          currentCard={currentCard}
          isFlipped={isFlipped}
          isDebug={isDebug}
          speak={speak}
          dragValues={{ x, y, rotate, opacity }}
          dragHandlers={{ onDrag: handleDrag, onDragEnd: handleDragEnd }}
          width={cardSize.width}
          height={cardSize.height}
        />
      </div>

      {/* Controls */}
      <StudyControls 
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        handleRate={handleRate}
        highlightedRating={highlightedRating}
      />
    </div>
  )
}
