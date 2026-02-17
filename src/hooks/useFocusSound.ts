import useSound from 'use-sound'
import { useAtomValue } from 'jotai'
import { soundEffectVolumeAtom } from '../state'
import focusSound from '../assets/focus.mp3'

export const useFocusSound = () => {
  const volume = useAtomValue(soundEffectVolumeAtom)
  const [play] = useSound(focusSound, { volume })
  return play
}
