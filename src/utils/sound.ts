import { Howl } from 'howler'

export const addHowlListener = (
  sound: Howl | null,
  event: string,
  callback: () => void
) => {
  if (sound instanceof Howl) {
    sound.on(event, callback)
    return () => sound.off(event, callback)
  }
  return () => {}
}

export const noop = () => {}

// Dummy implementation for romajiToHiragana if needed
export const romajiToHiragana = (text: string) => text