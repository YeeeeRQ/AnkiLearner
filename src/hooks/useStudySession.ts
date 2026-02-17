import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, type Card } from '../db'
import { schedule } from '../scheduler'
import { prefetchPhonetics } from '../utils/phoneticFetcher'
import usePronunciation, { usePrefetchPronunciationSound } from './usePronunciation'
import { useFlipSound } from './useFlipSound'

export function useStudySession() {
  const { id } = useParams()
  const deckId = parseInt(id || '0')
  const navigate = useNavigate()

  const [queue, setQueue] = useState<Card[]>([])
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [autoShowAnswer, setAutoShowAnswer] = useState(false)
  const [autoPlayAudio, setAutoPlayAudio] = useState(false)
  const [history, setHistory] = useState<Card[]>([])
  const [showComplete, setShowComplete] = useState(false)

  const { play: playPronunciation } = usePronunciation(currentCard?.front || '')
  
  // Prefetch next card's audio
  usePrefetchPronunciationSound(queue[1]?.front)

  const playFlipSound = useFlipSound()

  const speak = useCallback((text: string) => {
    console.log('useStudySession speak called with:', text, 'currentCard:', currentCard?.front);
    if (text === currentCard?.front) {
      console.log('Playing pronunciation via usePronunciation hook');
      playPronunciation()
    } else {
      console.log('Playing pronunciation via SpeechSynthesis (fallback)');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 1.0
        window.speechSynthesis.speak(utterance)
      } else {
        console.warn('SpeechSynthesis API not available');
      }
    }
  }, [currentCard, playPronunciation])

  // Auto-play audio when card changes
  useEffect(() => {
    if (autoPlayAudio && currentCard && !loading) {
      const timer = setTimeout(() => {
        playPronunciation()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentCard, autoPlayAudio, loading, playPronunciation])

  useEffect(() => {
    async function loadCards() {
      if (isNaN(deckId)) return
      
      const deck = await db.decks.get(deckId)
      const shouldAutoShow = !!deck?.autoShowAnswer
      const shouldAutoPlay = !!deck?.autoPlayAudio
      setAutoShowAnswer(shouldAutoShow)
      setAutoPlayAudio(shouldAutoPlay)

      const now = Date.now()
      
      const dueCards = await db.cards
        .where('deckId').equals(deckId)
        .filter(c => c.state !== 'new' && c.due <= now)
        .toArray()
      
      const newCards = await db.cards
        .where({ deckId, state: 'new' })
        .limit(20)
        .toArray()
        
      const combined = [...dueCards, ...newCards]
      combined.sort(() => Math.random() - 0.5)
      
      setQueue(combined)
      if (combined.length > 0) {
        setCurrentCard(combined[0])
        setIsFlipped(shouldAutoShow)
        // Auto-play handled by separate useEffect
      }
      setLoading(false)
    }
    loadCards()
  }, [deckId]) // Removed speak from dependency

  // Prefetch phonetics for upcoming cards
  useEffect(() => {
    if (queue.length > 0) {
      // Prefetch next 5 cards in queue
      prefetchPhonetics(queue.slice(0, 5));
    }
  }, [queue]);

  const handleRate = useCallback(async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return
    
    playFlipSound()

    const now = Date.now()
    const { interval, ease, due } = schedule(currentCard, rating)

    const nextState = rating === 1 ? 'relearning' : 
                      (currentCard.state === 'new' ? 'learning' : 
                      (interval >= 1 ? 'review' : 'learning'))

    await db.transaction('rw', db.cards, db.logs, async () => {
      await db.logs.add({
        cardId: currentCard.id!,
        rating,
        state: currentCard.state,
        due,
        interval,
        ease,
        time_taken: 0,
        timestamp: now
      })

      await db.cards.update(currentCard.id!, {
        state: nextState,
        due,
        interval,
        ease,
        reps: currentCard.reps + 1,
        lapses: rating === 1 ? currentCard.lapses + 1 : currentCard.lapses,
        last_review: now
      })
    })

    setHistory(prev => [...prev, currentCard])

    const nextQueue = queue.slice(1)
    
    if (nextQueue.length > 0) {
      setQueue(nextQueue)
      const nextCard = nextQueue[0]
      setCurrentCard(nextCard)
      setIsFlipped(autoShowAnswer)
      if (autoPlayAudio) {
        setTimeout(() => speak(nextCard.front), 500)
      }
    } else {
      setShowComplete(true)
    }
  }, [currentCard, queue, navigate, autoShowAnswer, autoPlayAudio, speak, playFlipSound])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || !currentCard || showComplete) return

      if (e.code === 'Space') {
        e.preventDefault()
        setIsFlipped((prev) => !prev)
        return
      }

      if (!isFlipped) {
        if (e.code === 'Enter') {
          e.preventDefault()
          setIsFlipped(true)
        }
      } else {
        switch (e.key) {
          case '1':
            handleRate(1)
            break
          case '2':
            handleRate(2)
            break
          case '3':
          case 'Enter':
            e.preventDefault()
            handleRate(3)
            break
          case '4':
            handleRate(4)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, currentCard, isFlipped, handleRate, showComplete])

  return {
    queue,
    currentCard,
    isFlipped,
    setIsFlipped,
    loading,
    history,
    showComplete,
    handleRate,
    speak,
    setShowComplete,
    navigate,
    autoPlayAudio,
    setAutoPlayAudio
  }
}
