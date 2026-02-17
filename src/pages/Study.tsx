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
    <div className="max-w-2xl mx-auto h-dvh flex flex-col relative overscroll-none pt-16 pb-8">
      {/* Drag Path Visualization */}
      <DragPathVisual dragPath={dragPath} />

      {/* Tutorial Overlay */}
      <StudyTutorial />

      {/* Header (Back & Progress) */}
      <StudyHeader 
        queueLength={queue.length}
        currentCard={currentCard}
        isDebug={isDebug}
        debugStatus={debugStatus}
        onBack={() => navigate(-1)}
        autoPlayAudio={autoPlayAudio}
        onToggleAutoPlay={() => setAutoPlayAudio(!autoPlayAudio)}
      />

      {/* Card Area */}
      <div className="relative w-full flex-1">
        
        {/* Previous Card (Left) */}
        {history.length > 0 && (() => {
          const prevCard = history[history.length - 1];
          const prevSkin = getSkinForCard(prevCard.id);
          return (
            <div 
              className="absolute left-1/2 top-1/2 transform -translate-x-[200px] -translate-y-1/2 -rotate-6 scale-90 opacity-60 pointer-events-none select-none z-0"
              style={cardDimensions}
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
              className="absolute left-1/2 top-1/2 transform translate-x-[200px] -translate-y-1/2 rotate-6 scale-90 opacity-60 pointer-events-none select-none z-0"
              style={cardDimensions}
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
