interface DragPath {
  start: { x: number; y: number }
  current: { x: number; y: number }
}

interface DragVisualsProps {
  dragPath: DragPath | null
  highlightedRating?: 1 | 2 | 3 | 4 | null
}

export function DragPathVisual({ dragPath, highlightedRating }: DragVisualsProps) {
  if (!dragPath) return null
  
  const CANCEL_RADIUS = 60
  const dx = dragPath.current.x - dragPath.start.x
  const dy = dragPath.current.y - dragPath.start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const isCancelled = distance < CANCEL_RADIUS

  const getRatingInfo = (rating: number) => {
    switch (rating) {
      case 1: return { text: "重来", color: "rgba(239, 68, 68, 0.9)", bgColor: "rgba(254, 226, 226, 0.3)", stroke: "rgba(239, 68, 68, 0.8)" }
      case 2: return { text: "困难", color: "rgba(249, 115, 22, 0.9)", bgColor: "rgba(255, 237, 213, 0.3)", stroke: "rgba(249, 115, 22, 0.8)" }
      case 3: return { text: "一般", color: "rgba(34, 197, 94, 0.9)", bgColor: "rgba(220, 252, 231, 0.3)", stroke: "rgba(34, 197, 94, 0.8)" }
      case 4: return { text: "简单", color: "rgba(59, 130, 246, 0.9)", bgColor: "rgba(219, 234, 254, 0.3)", stroke: "rgba(59, 130, 246, 0.8)" }
      default: return null
    }
  }

  const ratingInfo = highlightedRating ? getRatingInfo(highlightedRating) : null
  const showRating = !isCancelled && ratingInfo

  const LINE_LENGTH = 120
  const QUADRANT_COLOR = "rgba(156, 163, 175, 0.3)" // neutral-400 with opacity

  return (
    <svg className="fixed inset-0 pointer-events-none z-50 overflow-visible">
      {/* Quadrant Lines */}
      <g stroke={QUADRANT_COLOR} strokeWidth="1" strokeDasharray="4 4">
        {/* Top Right (Good) */}
        <line x1={dragPath.start.x} y1={dragPath.start.y} x2={dragPath.start.x + LINE_LENGTH} y2={dragPath.start.y - LINE_LENGTH} />
        {/* Bottom Right (Easy) */}
        <line x1={dragPath.start.x} y1={dragPath.start.y} x2={dragPath.start.x + LINE_LENGTH} y2={dragPath.start.y + LINE_LENGTH} />
        {/* Bottom Left (Retry) */}
        <line x1={dragPath.start.x} y1={dragPath.start.y} x2={dragPath.start.x - LINE_LENGTH} y2={dragPath.start.y + LINE_LENGTH} />
        {/* Top Left (Hard) */}
        <line x1={dragPath.start.x} y1={dragPath.start.y} x2={dragPath.start.x - LINE_LENGTH} y2={dragPath.start.y - LINE_LENGTH} />
      </g>

      {/* Center Zone */}
      <g>
        <circle 
          cx={dragPath.start.x} 
          cy={dragPath.start.y} 
          r={CANCEL_RADIUS} 
          fill={isCancelled ? "rgba(254, 202, 202, 0.3)" : (showRating ? ratingInfo.bgColor : "rgba(254, 226, 226, 0.1)")} 
          stroke={isCancelled ? "rgba(239, 68, 68, 0.8)" : (showRating ? ratingInfo.stroke : "rgba(252, 165, 165, 0.5)")} 
          strokeWidth="2" 
          strokeDasharray="4 4"
        />
        {isCancelled && (
          <text 
            x={dragPath.start.x} 
            y={dragPath.start.y} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="rgba(239, 68, 68, 0.9)" 
            className="font-bold font-sans"
            style={{ fontSize: '14px' }}
          >
            取消
          </text>
        )}
        {showRating && (
          <text 
            x={dragPath.start.x} 
            y={dragPath.start.y} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill={ratingInfo.color} 
            className="font-bold font-sans"
            style={{ fontSize: '16px' }}
          >
            {ratingInfo.text}
          </text>
        )}
      </g>

      {/* Drag Line */}
      <line 
        x1={dragPath.start.x} 
        y1={dragPath.start.y} 
        x2={dragPath.current.x} 
        y2={dragPath.current.y} 
        stroke={showRating ? ratingInfo?.stroke : "rgba(96, 165, 250, 0.6)"} 
        strokeWidth="3" 
        strokeDasharray="8 4"
        strokeLinecap="round"
      />
      {/* Hide start point circle when text is displayed to avoid overlap */}
      {!isCancelled && !showRating && (
        <circle cx={dragPath.start.x} cy={dragPath.start.y} r="6" fill="rgba(96, 165, 250, 0.4)" stroke="rgba(96, 165, 250, 0.8)" strokeWidth="2" />
      )}
      <circle cx={dragPath.current.x} cy={dragPath.current.y} r="8" fill={showRating ? ratingInfo?.color : "rgba(96, 165, 250, 1)"} stroke="white" strokeWidth="2" />
    </svg>
  )
}

export function DebugOverlay({ isDebug }: { isDebug: boolean }) {
  if (!isDebug) return null

  return (
    <div className="absolute inset-0 z-50 pointer-events-none rounded-3xl overflow-hidden opacity-50">
      <div className="w-full h-1/2 bg-yellow-100 border-b border-black/10 flex items-center justify-center text-yellow-800 font-mono text-xs">
        UPPER HALF (DEBUG)
      </div>
      <div className="w-full h-1/2 bg-red-100 flex items-center justify-center text-red-800 font-mono text-xs">
        LOWER HALF (DEBUG)
      </div>
    </div>
  )
}
