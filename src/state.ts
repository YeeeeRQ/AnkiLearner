import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Global app state
export const currentDeckIdAtom = atom<number | null>(null)

// Theme state: 'dark' | 'light' | 'system'
export const themeAtom = atomWithStorage<'dark' | 'light' | 'system'>('app-theme', 'system')
