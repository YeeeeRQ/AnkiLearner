import Dexie, { type Table } from 'dexie';
import { fetchAndImportDeck } from './utils/dictionaryFetcher';
import { dictionaries } from './resources/dictionaries';

export interface Deck {
  id?: number;
  name: string;
  description?: string;
  created_at: number;
  autoShowAnswer?: boolean; // If true, answer is shown immediately during study
  autoPlayAudio?: boolean; // If true, audio plays automatically when card is shown
}

export interface Card {
  id?: number;
  deckId: number;
  
  // Content
  front: string;
  back: string;
  phonetic?: string;
  note?: string;
  
  // SRS State
  state: 'new' | 'learning' | 'review' | 'relearning';
  step?: number;      // Current step index in learning/relearning phase
  due: number;        // Due date timestamp
  interval: number;   // Interval in days
  ease: number;       // Ease factor (default 2.5)
  reps: number;       // Total repetitions
  lapses: number;     // Total lapses (forgotten)
  
  created_at: number;
  last_review: number;
}

export interface ReviewLog {
  id?: number;
  cardId: number;
  rating: 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
  state: 'new' | 'learning' | 'review' | 'relearning';
  due: number;
  interval: number;
  ease: number;
  time_taken: number; // ms
  timestamp: number;
}

class AnkiDB extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card>;
  logs!: Table<ReviewLog>;

  constructor() {
    super('AnkiCloneDB');
    this.version(1).stores({
      decks: '++id, name, created_at',
      cards: '++id, deckId, state, due, created_at, [deckId+state], [deckId+due]',
      logs: '++id, cardId, timestamp, rating'
    });
  }
}

export const db = new AnkiDB();

// Helper to add initial deck if empty
let isInitializing = false;
export async function initDB() {
  // Prevent double initialization in Strict Mode or rapid re-renders
  if (isInitializing) return;

  // Check if we've already initialized the app before
  const isInitialized = localStorage.getItem('app_initialized');
  if (isInitialized === 'true') return;

  try {
    isInitializing = true;
    const count = await db.decks.count();
    
    if (count === 0) {
      // Import CET-4 Deck from public/dicts using fetcher
      // We use the first available dictionary as default
      const defaultDict = dictionaries[0];
      if (defaultDict) {
        try {
          await fetchAndImportDeck(defaultDict.url, defaultDict.name, defaultDict.description);
          // Mark as initialized only after successful import
          localStorage.setItem('app_initialized', 'true');
        } catch (e) {
          console.error("Failed to load initial deck:", e);
        }
      }
    } else {
      // If there are already decks (e.g. from a previous session where we didn't set the flag), mark as initialized
      localStorage.setItem('app_initialized', 'true');
    }
  } finally {
    isInitializing = false;
  }
}
