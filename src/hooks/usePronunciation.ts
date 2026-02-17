import { pronunciationConfigAtom, type PronunciationConfig } from '../state'
import { romajiToHiragana } from '../utils/sound'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export type PronunciationType = PronunciationConfig['type']

export function generateWordSoundSrc(word: string, pronunciation: PronunciationType): string {
  const encodedWord = encodeURIComponent(word)
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${encodedWord}&type=1`
    case 'us':
      return `${pronunciationApi}${encodedWord}&type=2`
    case 'romaji':
      return `${pronunciationApi}${romajiToHiragana(word)}&le=jap`
    case 'zh':
      return `${pronunciationApi}${encodedWord}&le=zh`
    case 'ja':
      return `${pronunciationApi}${encodedWord}&le=jap`
    case 'de':
      return `${pronunciationApi}${encodedWord}&le=de`
    case 'hapin':
    case 'kk':
      return `${pronunciationApi}${encodedWord}&le=ru` // 有道不支持哈萨克语, 暂时用俄语发音兜底
    case 'id':
      return `${pronunciationApi}${encodedWord}&le=id`
    default:
      return ''
  }
}

export interface UsePronunciationOptions {
  loop?: boolean
  onPlayError?: (err: any) => void
  preload?: boolean
}

export default function usePronunciation(word: string, options?: UsePronunciationOptions | boolean) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  
  const loop = useMemo(() => {
    if (typeof options === 'boolean') return options
    return options?.loop ?? pronunciationConfig.isLoop
  }, [options, pronunciationConfig.isLoop])

  const onPlayError = useMemo(() => {
    if (typeof options === 'object' && options !== null) {
      return options.onPlayError
    }
    return undefined
  }, [options])
  
  const preload = useMemo(() => {
    if (typeof options === 'object' && options !== null) {
      return options.preload ?? true
    }
    return true
  }, [options])

  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const soundSrc = generateWordSoundSrc(word, pronunciationConfig.type)

  useEffect(() => {
    if (!soundSrc) return
    if (!preload) return

    const audio = new Audio(soundSrc)
    audioRef.current = audio
    // Preload audio
    audio.load()

    const handlePlay = () => setIsPlaying(true)
    const handleEnded = () => setIsPlaying(false)
    const handlePause = () => setIsPlaying(false)
    const handleError = (e: Event) => {
      console.error('Audio play error:', e, 'Source:', soundSrc)
      setIsPlaying(false)
      onPlayError?.(e)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
  }, [soundSrc, onPlayError, preload])

  const play = useCallback(() => {
    let audio = audioRef.current
    
    // Lazy initialization if not preloaded or if audio source changed (though useEffect handles src change cleanup)
    if (!audio && soundSrc) {
       audio = new Audio(soundSrc)
       audioRef.current = audio
       
       const handlePlay = () => setIsPlaying(true)
       const handleEnded = () => setIsPlaying(false)
       const handlePause = () => setIsPlaying(false)
       const handleError = (e: Event) => {
         console.error('Audio play error:', e, 'Source:', soundSrc)
         setIsPlaying(false)
         onPlayError?.(e)
       }

       audio.addEventListener('play', handlePlay)
       audio.addEventListener('ended', handleEnded)
       audio.addEventListener('pause', handlePause)
       audio.addEventListener('error', handleError)
    }
    
    if (!audio) return

    audio.loop = loop
    audio.volume = pronunciationConfig.volume
    // Note: playbackRate changes might not apply instantly on all browsers before metadata is loaded
    audio.playbackRate = pronunciationConfig.rate

    audio.play().catch((err) => {
      console.error('Audio playback failed:', err)
      setIsPlaying(false)
      onPlayError?.(err)
    })
  }, [loop, pronunciationConfig.volume, pronunciationConfig.rate, onPlayError, soundSrc])
  
  // Cleanup effect for lazy-loaded audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = '' // Stop loading
        audioRef.current = null
        setIsPlaying(false)
      }
    }
  }, [soundSrc]) // Cleanup whenever soundSrc changes, regardless of preload

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  return { play, stop, isPlaying }
}

export function usePrefetchPronunciationSound(word: string | undefined, enabled: boolean = true) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  useEffect(() => {
    if (!word || !enabled) return

    const soundUrl = generateWordSoundSrc(word, pronunciationConfig.type)
    if (soundUrl === '') return

    // Mimic the fetch request structure provided by user for preloading
    // We use mode: 'no-cors' to handle opaque responses and populate browser cache
    fetch(soundUrl, {
      mode: 'no-cors',
      headers: {
        'Accept': '*/*',
      },
      credentials: 'omit'
    }).catch(err => {
      console.error('Prefetch failed:', err)
    })

  }, [pronunciationConfig.type, word, enabled])
}
