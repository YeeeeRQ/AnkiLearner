// 简化版 SM-2 算法
import { type Card } from './db';

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_MIN = 60 * 1000;

export interface SchedulingInfo {
  interval: number; // in days
  ease: number;
  due: number; // timestamp
}

export function schedule(
  card: Card,
  rating: 1 | 2 | 3 | 4 // Again, Hard, Good, Easy
): SchedulingInfo {
  let interval = card.interval;
  let ease = card.ease;
  const now = Date.now();

  // New & Learning & Relearning Logic (Simplified steps: 1min, 10min)
  if (card.state === 'new' || card.state === 'learning' || card.state === 'relearning') {
    if (rating === 1) { // Again
      return { interval: 0, ease, due: now + ONE_MIN }; // 1 min later
    } else if (rating === 2) { // Hard
      return { interval: 0, ease, due: now + 5 * ONE_MIN }; // 5 min later
    } else if (rating === 3) { // Good -> Graduate
      return { interval: 1, ease, due: now + ONE_DAY }; // 1 day later
    } else { // Easy -> Graduate
      return { interval: 4, ease, due: now + 4 * ONE_DAY }; // 4 days later
    }
  }

  // Review Logic (SM-2)
  // Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
  
  if (rating === 1) { // Again -> Lapse
    return { 
      interval: 0, 
      ease: Math.max(1.3, ease - 0.2), 
      due: now + ONE_MIN // Relearning step 1
    }; 
  }

  if (rating === 2) { // Hard
    interval = Math.max(1, interval * 1.2);
    ease = Math.max(1.3, ease - 0.15);
  } else if (rating === 3) { // Good
    interval = Math.max(1, interval * ease);
    // Ease unchanged
  } else if (rating === 4) { // Easy
    interval = Math.max(1, interval * ease * 1.3);
    ease += 0.15;
  }

  return {
    interval: Math.round(interval),
    ease,
    due: now + Math.round(interval * ONE_DAY)
  };
}
