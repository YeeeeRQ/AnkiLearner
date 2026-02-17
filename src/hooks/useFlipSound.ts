import useSound from 'use-sound'
import { useAtomValue } from 'jotai'
import { soundEffectVolumeAtom } from '../state'
import flipSound from '../assets/flip.mp3'

export const useFlipSound = () => {
  const volume = useAtomValue(soundEffectVolumeAtom)
  const [play] = useSound(flipSound, { volume })
  return play
}
