import { Link } from 'react-router-dom'
import { useStudySession } from '../hooks/useStudySession'
import { useCardDrag } from '../hooks/useCardDrag'
import { StudyHeader } from '../components/study/StudyHeader'
import { StudyControls } from '../components/study/StudyControls'
import { FlashCard } from '../components/study/FlashCard'
import { DragPathVisual } from '../components/study/DragVisuals'
import { getSkinForCard } from '../components/study/CardSkins'
import { StudyTutorial } from '../components/study/StudyTutorial'
import { useRef, useState, useLayoutEffect, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { enableDragInteractionAtom } from '../state'

export default function Study() {
  const enableDrag = useAtomValue(enableDragInteractionAtom)

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

  const dragValues = useMemo(() => ({ x, y, rotate, opacity }), [x, y, rotate, opacity])

  const dragHandlers = useMemo(() => ({
    onDrag: (e: any, info: any) => {
      if (enableDrag && isFlipped) handleDrag(e, info)
    },
    onDragEnd: () => {
      if (enableDrag && isFlipped) handleDragEnd()
    }
  }), [enableDrag, isFlipped, handleDrag, handleDragEnd])

  // Preview state
  const [previewMode, setPreviewMode] = useState<'none' | 'prev' | 'next'>('none')

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

  if (loading) return (
    <>
      <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">加载中...</div>
    </>
  )

  if (!currentCard && !showComplete) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-2xl font-bold text-green-500 dark:text-green-400">今日任务已完成！</div>
          <div className="text-neutral-500 dark:text-neutral-400">该牌组暂时没有需要复习的卡片。</div>
          <Link to="/" className="bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700 transition">
            返回首页
          </Link>
        </div>
      </>
    )
  }

  if (showComplete) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-2xl font-bold text-green-500 dark:text-green-400">太棒了！</div>
          <div className="text-neutral-500 dark:text-neutral-400">你已经完成了本组卡片的复习。</div>
          <Link to="/" className="bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700 transition">
            返回首页
          </Link>
        </div>
      </>
    )
  }

  if (!currentCard) return <StudyTutorial /> // Should be handled by loading or completion state

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden overscroll-none flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Drag Path Visualization */}
      <DragPathVisual dragPath={dragPath} highlightedRating={highlightedRating} />

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
      <div 
        ref={containerRef} 
        className="flex-1 w-full relative flex items-center justify-center min-h-0"
        onClick={() => {
          if (previewMode !== 'none') {
            setPreviewMode('none')
          }
        }}
      >
        
        {/* Previous Card (Left) */}
        {history.length > 0 && (() => {
          const prevCard = history[history.length - 1];
          const prevSkin = getSkinForCard(prevCard.id);
          const isPreview = previewMode === 'prev';
          return (
            <div 
              className={`absolute left-1/2 top-1/2 transition-all duration-300 ease-out select-none rounded-3xl overflow-hidden ${isPreview ? 'z-30 opacity-100 cursor-zoom-out' : 'z-0 opacity-60 cursor-pointer pointer-events-auto'}`}
              style={{
                width: cardSize.width,
                height: cardSize.height,
                transform: isPreview 
                  ? 'translate(-50%, -50%) translateX(-10%) rotate(-2deg) scale(0.95)' 
                  : 'translate(-50%, -50%) translateX(-105%) rotate(-6deg) scale(0.9)',
                boxShadow: isPreview ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : undefined
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (previewMode === 'none') {
                  setPreviewMode('prev');
                } else {
                  setPreviewMode('none');
                }
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
          const isPreview = previewMode === 'next';
          return (
            <div 
              className={`absolute left-1/2 top-1/2 transition-all duration-300 ease-out select-none rounded-3xl overflow-hidden ${isPreview ? 'z-30 opacity-100 cursor-zoom-out' : 'z-0 opacity-60 cursor-pointer pointer-events-auto'}`}
              style={{
                width: cardSize.width,
                height: cardSize.height,
                transform: isPreview 
                  ? 'translate(-50%, -50%) translateX(10%) rotate(2deg) scale(0.95)' 
                  : 'translate(-50%, -50%) translateX(105%) rotate(6deg) scale(0.9)',
                boxShadow: isPreview ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : undefined
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (previewMode === 'none') {
                  setPreviewMode('next');
                } else {
                  setPreviewMode('none');
                }
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

        {/* Preview Overlay Indicator */}
        {previewMode !== 'none' && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-40 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md animate-fadeIn pointer-events-none">
            {previewMode === 'prev' ? '临时预览：上一张' : '临时预览：下一张'}
          </div>
        )}

        {/* Current Interactive Card */}
        <div 
          className={`transition-all duration-300 ${previewMode !== 'none' ? 'scale-90 opacity-40 blur-[1px]' : 'scale-100 opacity-100'}`}
          style={{ pointerEvents: previewMode !== 'none' ? 'none' : 'auto' }}
        >
        <FlashCard
          currentCard={currentCard}
          isFlipped={isFlipped}
          isDebug={isDebug}
          speak={speak}
          dragValues={dragValues}
          dragHandlers={dragHandlers}
          width={cardSize.width}
          height={cardSize.height}
          enableDrag={enableDrag}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
        </div>
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
