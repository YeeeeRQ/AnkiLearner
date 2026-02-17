import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import { useAtomValue } from 'jotai'
import { enableDragInteractionAtom, showDifficultyButtonsAtom } from '../../state'

interface StudyControlsProps {
  isFlipped: boolean
  setIsFlipped: (val: boolean) => void
  handleRate: (rating: 1 | 2 | 3 | 4) => void
  highlightedRating: 1 | 2 | 3 | 4 | null
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function StudyControls({ isFlipped, setIsFlipped, handleRate, highlightedRating, containerRef }: StudyControlsProps) {
  const enableDrag = useAtomValue(enableDragInteractionAtom)
  const showDifficultyButtons = useAtomValue(showDifficultyButtonsAtom)
  
  // Always show buttons if drag is disabled, otherwise respect the setting
  const shouldShowButtons = !enableDrag || showDifficultyButtons

  return (
    <div ref={containerRef} className="w-full flex justify-center px-4 pb-8 pt-4 z-40 shrink-0">
      <div className="flex flex-col items-center w-full max-w-2xl gap-4 md:gap-5">
        <div className={`grid grid-cols-4 gap-4 md:gap-3 w-full max-w-2xl transition-all duration-300 ${isFlipped && shouldShowButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <RatingButton 
            id="rating-btn-1"
            label="重来" 
            sub="1" 
            color="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500" 
            onClick={() => handleRate(1)} 
            isHighlighted={highlightedRating === 1}
          />
          <RatingButton 
            id="rating-btn-2"
            label="困难" 
            sub="2" 
            color="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500" 
            onClick={() => handleRate(2)} 
            isHighlighted={highlightedRating === 2}
          />
          <RatingButton 
            id="rating-btn-3"
            label="一般" 
            sub="3" 
            color="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500" 
            onClick={() => handleRate(3)} 
            isHighlighted={highlightedRating === 3}
          />
          <RatingButton 
            id="rating-btn-4"
            label="简单" 
            sub="4" 
            color="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500" 
            onClick={() => handleRate(4)} 
            isHighlighted={highlightedRating === 4}
          />
        </div>

        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full max-w-xl md:max-w-md font-semibold py-3 md:py-2.5 rounded-2xl md:rounded-xl shadow-lg transition transform active:scale-95 border-2 focus:outline-none flex flex-col items-center justify-center gap-0.5 ${
            isFlipped 
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50' 
              : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowsRightLeftIcon 
              className={`w-5 h-5 md:w-4.5 md:h-4.5 transition-transform duration-500`} 
              style={{ 
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                perspective: '1000px'
              }}
            />
            <span className="text-lg md:text-base tracking-wide">翻转</span>
          </div>
          <span className="text-xs opacity-70 font-mono font-normal tracking-wider md:text-[10px]">Space</span>
        </button>
      </div>
    </div>
  )
}

function RatingButton({ id, label, sub, color, onClick, isHighlighted }: { id?: string, label: string, sub: string, color: string, onClick: () => void, isHighlighted?: boolean }) {
  return (
    <button 
      id={id}
      onClick={onClick}
      className={`${color} text-white py-3 md:py-2 rounded-2xl md:rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-200 transform ${isHighlighted ? 'scale-110 ring-4 ring-offset-2 ring-blue-400 z-10' : 'active:scale-95'}`}
    >
      <span className="font-bold md:text-sm">{label}</span>
      <span className="text-xs opacity-80 font-mono md:text-[10px]">{sub}</span>
    </button>
  )
}
