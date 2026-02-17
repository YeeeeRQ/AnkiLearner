import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { showTutorialAtom } from '../../state';

const TUTORIAL_KEY = 'anki-learner-study-tutorial-seen';

export function StudyTutorial() {
  const [isVisible, setIsVisible] = useAtom(showTutorialAtom);

  useEffect(() => {
    const hasSeen = localStorage.getItem(TUTORIAL_KEY);
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, [setIsVisible]);

  const handleDismiss = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <div className="relative w-full max-w-sm h-[60vh] flex flex-col items-center justify-center pointer-events-none">
            
            {/* Center Card Placeholder */}
            <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-3xl flex items-center justify-center">
              <div className="text-white/80 text-center p-4">
                <p className="text-lg font-bold mb-2">拖拽卡片</p>
                <p className="text-sm opacity-70">Drag the card</p>
              </div>
            </div>

            {/* Top Left - Hard */}
            <div className="absolute -top-12 -left-4 flex flex-col items-center text-orange-400">
              <ArrowUturnLeftIcon className="w-8 h-8 -rotate-45 mb-1" />
              <span className="font-bold text-sm">困难 (Hard)</span>
            </div>

            {/* Top Right - Good */}
            <div className="absolute -top-12 -right-4 flex flex-col items-center text-green-400">
              <ArrowUturnLeftIcon className="w-8 h-8 rotate-[135deg] mb-1 scale-x-[-1]" />
              <span className="font-bold text-sm">一般 (Good)</span>
            </div>

            {/* Bottom Left - Again */}
            <div className="absolute -bottom-12 -left-4 flex flex-col items-center text-red-400">
              <ArrowUturnLeftIcon className="w-8 h-8 -rotate-[135deg] mt-1" />
              <span className="font-bold text-sm">重来 (Again)</span>
            </div>

            {/* Bottom Right - Easy */}
            <div className="absolute -bottom-12 -right-4 flex flex-col items-center text-blue-400">
              <ArrowUturnLeftIcon className="w-8 h-8 rotate-45 mt-1 scale-x-[-1]" />
              <span className="font-bold text-sm">简单 (Easy)</span>
            </div>

            {/* Tap Instruction */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border-2 border-white/50 animate-ping absolute" />
               <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                 <span className="text-2xl">👆</span>
               </div>
               <p className="text-white mt-16 text-sm font-medium">点击翻转 / Tap to Flip</p>
            </div>

          </div>

          {/* Dismiss Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute bottom-12 px-8 py-3 bg-white text-neutral-900 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
          >
            开始练习 (Start)
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
