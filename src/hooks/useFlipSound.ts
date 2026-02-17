import useSound from 'use-sound'
import flipSound from '../assets/flip-card-sounds.mp3'

export const useFlipSound = () => {
  const [play] = useSound(flipSound, { volume: 0.25 })
  return play
}
