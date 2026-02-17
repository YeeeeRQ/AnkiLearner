import { ArrowLeftIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'
import type { Card } from '../../db'

interface StudyHeaderProps {
  queueLength: number
  currentCard: Card | null
  isDebug: boolean
  debugStatus: string
  onBack: () => void
  autoPlayAudio: boolean
  onToggleAutoPlay: () => void
}

export function StudyHeader({ queueLength, currentCard, isDebug, debugStatus, onBack, autoPlayAudio, onToggleAutoPlay }: StudyHeaderProps) {
  return (
    <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center pointer-events-none">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 transition-colors pointer-events-auto"
        title="Return"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>

      {/* Debug Status Label */}
      {isDebug && debugStatus && (
        <div className="absolute left-1/2 top-16 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono z-50 pointer-events-none whitespace-nowrap">
          {debugStatus}
        </div>
      )}

      {/* Right Controls Group */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Auto-Play Toggle */}
        <button
          onClick={onToggleAutoPlay}
          className={`p-2 rounded-full shadow-sm border backdrop-blur-md transition-all ${
            autoPlayAudio 
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
              : 'bg-white/80 text-neutral-400 hover:text-neutral-600 border-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-500 dark:border-neutral-700'
          }`}
          title={autoPlayAudio ? "Auto-play Audio: ON" : "Auto-play Audio: OFF"}
        >
          {autoPlayAudio ? (
            <SpeakerWaveIcon className="w-5 h-5" />
          ) : (
            <SpeakerXMarkIcon className="w-5 h-5" />
          )}
        </button>

        {/* Progress Info */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <span>剩余: {queueLength}</span>
          <span className="w-px h-3 bg-neutral-300 dark:bg-neutral-600"></span>
          <span>{currentCard?.state === 'new' ? '新卡' : '复习'}</span>
        </div>
      </div>
    </div>
  )
}
