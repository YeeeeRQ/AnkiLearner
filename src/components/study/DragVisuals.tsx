interface DragPath {
  start: { x: number; y: number }
  current: { x: number; y: number }
}

interface DragVisualsProps {
  dragPath: DragPath | null
}

export function DragPathVisual({ dragPath }: DragVisualsProps) {
  if (!dragPath) return null
  
  const CANCEL_RADIUS = 60
  const dx = dragPath.current.x - dragPath.start.x
  const dy = dragPath.current.y - dragPath.start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const isCancelled = distance < CANCEL_RADIUS

  return (
    <svg className="fixed inset-0 pointer-events-none z-50 overflow-visible">
      {/* Cancel Zone */}
      <g>
        <circle 
          cx={dragPath.start.x} 
          cy={dragPath.start.y} 
          r={CANCEL_RADIUS} 
          fill={isCancelled ? "rgba(254, 202, 202, 0.3)" : "rgba(254, 226, 226, 0.1)"} 
          stroke={isCancelled ? "rgba(239, 68, 68, 0.8)" : "rgba(252, 165, 165, 0.5)"} 
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
      </g>

      {/* Drag Line */}
      <line 
        x1={dragPath.start.x} 
        y1={dragPath.start.y} 
        x2={dragPath.current.x} 
        y2={dragPath.current.y} 
        stroke="rgba(96, 165, 250, 0.6)" 
        strokeWidth="3" 
        strokeDasharray="8 4"
        strokeLinecap="round"
      />
      <circle cx={dragPath.start.x} cy={dragPath.start.y} r="6" fill="rgba(96, 165, 250, 0.4)" stroke="rgba(96, 165, 250, 0.8)" strokeWidth="2" />
      <circle cx={dragPath.current.x} cy={dragPath.current.y} r="8" fill="rgba(96, 165, 250, 1)" stroke="white" strokeWidth="2" />
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
