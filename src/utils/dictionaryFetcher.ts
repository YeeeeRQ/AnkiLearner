import { db, type Card } from '../db'

export interface DictWord {
  front: string
  back: string
  phonetic?: string
  note?: string
}

export async function fetchAndImportDeck(url: string, deckName: string, description: string = '') {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch dictionary: ${response.statusText}`)
    }
    
    const words: DictWord[] = await response.json()
    
    // Create Deck
    const deckId = await db.decks.add({
      name: deckName,
      description: description,
      created_at: Date.now(),
      autoShowAnswer: true,
      autoPlayAudio: true
    })

    // Create Cards
    const cards = words.map(w => ({
      deckId,
      front: w.front,
      back: w.back,
      phonetic: w.phonetic,
      note: w.note || '',
      state: 'new',
      step: 0,
      due: Date.now(),
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      last_review: 0,
      created_at: Date.now()
    } as unknown as Card))

    await db.cards.bulkAdd(cards)
    return deckId
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  }
}
