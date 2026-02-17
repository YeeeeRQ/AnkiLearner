import { pronunciationConfigAtom, PronunciationConfig } from '../state'
import { addHowlListener, noop, romajiToHiragana } from '../utils/sound'
import { Howl } from 'howler'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState, useCallback } from 'react'
import useSound from 'use-sound'
import { HookOptions } from 'use-sound/dist/types'

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export type PronunciationType = PronunciationConfig['type']

export function generateWordSoundSrc(word: string, pronunciation: PronunciationType): string {
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${word}&type=1`
    case 'us':
      return `${pronunciationApi}${word}&type=2`
    case 'romaji':
      return `${pronunciationApi}${romajiToHiragana(word)}&le=jap`
    case 'zh':
      return `${pronunciationApi}${word}&le=zh`
    case 'ja':
      return `${pronunciationApi}${word}&le=jap`
    case 'de':
      return `${pronunciationApi}${word}&le=de`
    case 'hapin':
    case 'kk':
      return `${pronunciationApi}${word}&le=ru` // 有道不支持哈萨克语, 暂时用俄语发音兜底
    case 'id':
      return `${pronunciationApi}${word}&le=id`
    default:
      return ''
  }
}

export default function usePronunciation(word: string, isLoop?: boolean) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const loop = useMemo(() => (typeof isLoop === 'boolean' ? isLoop : pronunciationConfig.isLoop), [isLoop, pronunciationConfig.isLoop])
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  const soundSrc = generateWordSoundSrc(word, pronunciationConfig.type)

  const [play, { stop, sound }] = useSound(soundSrc, {
    html5: true,
    format: ['mp3'],
    loop,
    volume: pronunciationConfig.volume,
    rate: pronunciationConfig.rate,
    onloaderror: (_id, err) => {
      console.warn('Sound load error, falling back to system TTS', err)
      setHasError(true)
    },
    onplayerror: (_id, err) => {
      console.warn('Sound play error, falling back to system TTS', err)
      setHasError(true)
    }
  } as HookOptions)

  // System TTS fallback
  const speakSystem = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = pronunciationConfig.type === 'uk' ? 'en-GB' : 'en-US' // Simple mapping
      utterance.rate = pronunciationConfig.rate
      utterance.volume = pronunciationConfig.volume
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }, [word, pronunciationConfig])

  const handlePlay = useCallback(() => {
    if (hasError || !soundSrc) {
      speakSystem()
    } else {
      // If we have a sound object but it's in error state, fallback
      if (sound && sound.state() === 'unloaded' && hasError) {
          speakSystem()
          return
      }
      play()
    }
  }, [hasError, soundSrc, speakSystem, play, sound])

  useEffect(() => {
    if (!sound) return
    sound.loop(loop)
    return noop
  }, [loop, sound])

  useEffect(() => {
    if (!sound) return
    const unListens: Array<() => void> = []

    unListens.push(addHowlListener(sound, 'play', () => setIsPlaying(true)))
    unListens.push(addHowlListener(sound, 'end', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'pause', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'playerror', () => {
        setIsPlaying(false)
        setHasError(true)
    }))
    unListens.push(addHowlListener(sound, 'loaderror', () => {
        setHasError(true)
    }))

    return () => {
      setIsPlaying(false)
      unListens.forEach((unListen) => unListen())
      ;(sound as Howl).unload()
    }
  }, [sound])

  // Reset error when word changes
  useEffect(() => {
    setHasError(false)
  }, [word, pronunciationConfig.type])

  return { play: handlePlay, stop, isPlaying }
}

export function usePrefetchPronunciationSound(word: string | undefined) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  useEffect(() => {
    if (!word) return

    const soundUrl = generateWordSoundSrc(word, pronunciationConfig.type)
    if (soundUrl === '') return

    const head = document.head
    const isPrefetch = (Array.from(head.querySelectorAll('link[href]')) as HTMLLinkElement[]).some((el) => el.href === soundUrl)

    if (!isPrefetch) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.preload = 'auto'

      // audio.crossOrigin = 'anonymous' // Remove this line to avoid CORS issues with Youdao API
      audio.style.display = 'none'

      head.appendChild(audio)

      return () => {
        head.removeChild(audio)
      }
    }
  }, [pronunciationConfig.type, word])
}