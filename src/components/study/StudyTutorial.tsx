import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
import { showTutorialAtom } from '../../state';
import { HandThumbUpIcon, HandThumbDownIcon, ClockIcon, FaceSmileIcon, XCircleIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';

const TouchIcon = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.02-.24-.02-.31 0-.61.13-.82.35l-.66.66 4.35 4.35c.38.38.91.59 1.45.59h6.6c.96 0 1.8-.68 1.96-1.63l.73-4.18c.07-.39-.03-.79-.3-1.11z" />
  </svg>
)

const TUTORIAL_KEY = 'anki-learner-study-tutorial-seen';

export function StudyTutorial() {
  const [isVisible, setIsVisible] = useAtom(showTutorialAtom);
  const location = useLocation();
  const isStudyPage = location.pathname.includes('/study');
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    // Only auto-show tutorial on study page
    if (isStudyPage) {
      const hasSeen = localStorage.getItem(TUTORIAL_KEY);
      if (!hasSeen) {
        setIsVisible(true);
      }
    }
  }, [setIsVisible, isStudyPage]);

  const handleDismiss = () => {
    if (isStudyPage) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Colors matching DragVisuals.tsx
  const colors = {
    retry: { text: "text-red-500", bg: "bg-red-100", border: "border-red-400", hex: "#ef4444" },
    hard: { text: "text-orange-500", bg: "bg-orange-100", border: "border-orange-400", hex: "#f97316" },
    good: { text: "text-green-500", bg: "bg-green-100", border: "border-green-400", hex: "#22c55e" },
    easy: { text: "text-blue-500", bg: "bg-blue-100", border: "border-blue-400", hex: "#3b82f6" },
    neutral: { stroke: "rgba(156, 163, 175, 0.5)" }
  };

  const LINE_LENGTH = 140; // Slightly longer for tutorial visibility
  // Using 45 degree angle (equal x and y offset)
  const OFFSET = LINE_LENGTH / Math.sqrt(2); 

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 touch-none"
          onClick={handleDismiss}
        >
          <div className="relative w-full max-w-sm aspect-[2/3] flex items-center justify-center pointer-events-none">
            
            {/* Background SVG Diagram */}
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#fff" fillOpacity="0.6" />
                </marker>
              </defs>
            </svg>

            {/* Center Card Placeholder (Ghost) */}
            <div className="absolute w-64 h-96 border-2 border-dashed border-white/20 rounded-3xl flex items-center justify-center bg-white/5">
              <div className="text-white/40 font-mono text-sm tracking-widest">CARD AREA</div>
            </div>

            {/* Interaction Zones - Positioned at 45 degrees */}
            
            {/* Top Left: Hard */}
            <motion.div 
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: -LINE_LENGTH, y: -LINE_LENGTH, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <div className={`w-12 h-12 rounded-full ${colors.hard.bg} flex items-center justify-center border-2 ${colors.hard.border} shadow-[0_0_15px_rgba(249,115,22,0.5)]`}>
                <ClockIcon className={`w-6 h-6 ${colors.hard.text}`} />
              </div>
              <span className={`mt-2 font-bold ${colors.hard.text} bg-black/50 px-2 py-1 rounded text-xs`}>困难 (Hard)</span>
            </motion.div>

            {/* Top Right: Good */}
            <motion.div 
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: LINE_LENGTH, y: -LINE_LENGTH, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <div className={`w-12 h-12 rounded-full ${colors.good.bg} flex items-center justify-center border-2 ${colors.good.border} shadow-[0_0_15px_rgba(34,197,94,0.5)]`}>
                <HandThumbUpIcon className={`w-6 h-6 ${colors.good.text}`} />
              </div>
              <span className={`mt-2 font-bold ${colors.good.text} bg-black/50 px-2 py-1 rounded text-xs`}>一般 (Good)</span>
            </motion.div>

            {/* Bottom Left: Retry */}
            <motion.div 
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: -LINE_LENGTH, y: LINE_LENGTH, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <div className={`w-12 h-12 rounded-full ${colors.retry.bg} flex items-center justify-center border-2 ${colors.retry.border} shadow-[0_0_15px_rgba(239,68,68,0.5)]`}>
                <HandThumbDownIcon className={`w-6 h-6 ${colors.retry.text}`} />
              </div>
              <span className={`mt-2 font-bold ${colors.retry.text} bg-black/50 px-2 py-1 rounded text-xs`}>重来 (Retry)</span>
            </motion.div>

            {/* Bottom Right: Easy */}
            <motion.div 
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: LINE_LENGTH, y: LINE_LENGTH, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <div className={`w-12 h-12 rounded-full ${colors.easy.bg} flex items-center justify-center border-2 ${colors.easy.border} shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
                <FaceSmileIcon className={`w-6 h-6 ${colors.easy.text}`} />
              </div>
              <span className={`mt-2 font-bold ${colors.easy.text} bg-black/50 px-2 py-1 rounded text-xs`}>简单 (Easy)</span>
            </motion.div>

            {/* Center: Cancel Zone */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute w-[120px] h-[120px] rounded-full border-2 border-dashed border-white/30 flex items-center justify-center"
            >
              <div className="text-white/30 text-[10px] mt-8 text-center leading-tight">
                <XCircleIcon className="w-4 h-4 mx-auto mb-1 opacity-50" />
                放回圈内取消操作
              </div>
            </motion.div>

            {/* Drag Instruction */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute flex flex-col items-center justify-center z-10 mt-4"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-2 animate-pulse">
                {isTouch ? (
                  <TouchIcon className="w-8 h-8 text-white" />
                ) : (
                  <CursorArrowRaysIcon className="w-8 h-8 text-white" />
                )}
              </div>
              {/* <span className="text-white font-medium text-sm bg-black/30 px-3 py-1 rounded-full mt-4">放回原点取消操作</span> */}
              <span className="text-white font-medium text-sm bg-black/30 px-3 py-1 rounded-full mt-4">沿虚线拖动卡片,拖向不同方向意为不同难度</span>
            </motion.div>

            {/* Arrows SVG Layer - Connecting center to items with 45 degree lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-30">
              <g stroke="white" strokeWidth="1" strokeDasharray="4 4" transform="translate(0, 0)">
                {/* 
                  Since we are in a flex container centered, we can use 50% for center.
                  However, to draw 45 degree lines, we can't just use percentages if aspect ratio isn't 1:1.
                  But visually, connecting the center to the icons (which are offset by +/- LINE_LENGTH) 
                  will create the correct visual lines.
                  
                  Actually, since we positioned the icons using absolute px offsets from center,
                  we can just draw lines from center to those offsets if we knew the center px.
                  
                  Alternatively, just drawing a large X cross through the center is enough to suggest diagonal movement.
                  We can use a large enough length.
                */}
                <line x1="50%" y1="50%" x2="calc(50% - 150px)" y2="calc(50% - 150px)" />
                <line x1="50%" y1="50%" x2="calc(50% + 150px)" y2="calc(50% - 150px)" />
                <line x1="50%" y1="50%" x2="calc(50% - 150px)" y2="calc(50% + 150px)" />
                <line x1="50%" y1="50%" x2="calc(50% + 150px)" y2="calc(50% + 150px)" />
              </g>
            </svg>

          </div>

          {/* Dismiss Button - Only show if in study mode, or show "Close" if in settings */}
          <div className="absolute bottom-8 flex flex-col items-center gap-4 w-full pointer-events-none">
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="px-8 py-3 bg-white text-neutral-900 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-transform pointer-events-auto flex items-center gap-2"
            >
              {isStudyPage ? (
                <>
                  <span>开始练习</span>
                  <span className="text-neutral-400 text-sm font-normal">(Start)</span>
                </>
              ) : (
                <span>关闭说明</span>
              )}
            </motion.button>
            
            {isStudyPage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-white/50 text-xs text-center"
              >
                可在 设置 - 交互设置 中再次查看此说明
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
