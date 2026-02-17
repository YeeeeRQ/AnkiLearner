import { db, type Card } from '../db';

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

export async function fetchPhoneticForCard(card: Card): Promise<string | undefined> {
  if (card.phonetic) return card.phonetic;
  if (!card.front) return undefined;

  try {
    const response = await fetch(`${API_BASE}${encodeURIComponent(card.front)}`);
    if (!response.ok) return undefined;

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Try to find the first phonetic text
      const text = data[0]?.phonetics?.find((p: any) => p.text)?.text || data[0]?.phonetic;
      
      if (text && card.id) {
        // Update database
        await db.cards.update(card.id, { phonetic: text });
        // Update local object
        card.phonetic = text;
        return text;
      }
    }
  } catch (error) {
    console.error(`Failed to fetch phonetic for ${card.front}`, error);
  }
  return undefined;
}

// Prefetch phonetics for a list of cards
// Returns a promise that resolves when all fetches are initiated (not necessarily completed)
export async function prefetchPhonetics(cards: Card[], concurrency = 3) {
  const cardsToFetch = cards.filter(c => !c.phonetic);
  
  // Simple concurrency control
  const results = [];
  for (let i = 0; i < cardsToFetch.length; i += concurrency) {
    const chunk = cardsToFetch.slice(i, i + concurrency);
    const chunkPromises = chunk.map(card => fetchPhoneticForCard(card));
    results.push(...(await Promise.all(chunkPromises)));
  }
  
  return results;
}
