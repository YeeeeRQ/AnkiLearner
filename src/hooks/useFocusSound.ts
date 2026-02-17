import useSound from 'use-sound'
import focusSound from '../assets/focus.mp3'

export const useFocusSound = () => {
  const [play] = useSound(focusSound, { volume: 0.5 })
  return play
}
