declare module 'use-sound' {
  export default function useSound(
    src: string | string[],
    options?: any
  ): [() => void, { stop: () => void; isPlaying: boolean; sound: any }];
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

