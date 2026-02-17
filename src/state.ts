import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Global app state
export const currentDeckIdAtom = atom<number | null>(null)

// Theme state: 'dark' | 'light' | 'system'
export const themeAtom = atomWithStorage<'dark' | 'light' | 'system'>('app-theme', 'system')

// Pronunciation config
export interface PronunciationConfig {
  type: 'uk' | 'us' | 'zh' | 'ja' | 'de' | 'id' | 'hapin' | 'kk' | 'romaji'
  isLoop: boolean
  volume: number
  rate: number
}

export const pronunciationConfigAtom = atomWithStorage<PronunciationConfig>('pronunciation-config', {
  type: 'us',
  isLoop: false,
  volume: 1,
  rate: 1
})

// Sound effect volume (0-1)
export const soundEffectVolumeAtom = atomWithStorage<number>('sound-effect-volume', 0.2)

// Drag interaction config
export const enableDragInteractionAtom = atomWithStorage<boolean>('enable-drag-interaction', true)

const isMobile = typeof window !== 'undefined' && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768)

// Show difficulty buttons config
// Default to hidden on mobile, visible on desktop
export const showDifficultyButtonsAtom = atomWithStorage<boolean>('show-difficulty-buttons', !isMobile)

// Tutorial visibility
export const showTutorialAtom = atom<boolean>(false)
