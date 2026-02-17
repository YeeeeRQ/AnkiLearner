import type { ReactNode } from 'react';

export interface CardSkin {
  id: string;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentColor: string;
  renderDecorations: (isBack: boolean) => ReactNode;
}

export const cardSkins: CardSkin[] = [
  {
    id: 'default',
    name: 'Minimalist',
    bgClass: 'bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900',
    borderClass: 'border-white/50 dark:border-neutral-700/50',
    textClass: 'text-neutral-800 dark:text-white',
    accentColor: 'text-blue-600 dark:text-blue-400',
    renderDecorations: (isBack) => (
      <>
        {!isBack ? (
          <>
            <svg className="absolute -top-12 -right-12 w-64 h-64 text-blue-400/5 dark:text-blue-400/10" viewBox="0 0 200 200" fill="currentColor">
              <circle cx="100" cy="100" r="100" />
            </svg>
            <svg className="absolute top-1/4 -left-8 w-24 h-24 text-purple-400/5 dark:text-purple-400/10" viewBox="0 0 200 200" fill="currentColor">
              <circle cx="100" cy="100" r="100" />
            </svg>
          </>
        ) : (
          <>
            <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" viewBox="0 0 100 100" preserveAspectRatio="none">
               <pattern id="grid-default" width="20" height="20" patternUnits="userSpaceOnUse">
                 <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
               <rect width="100%" height="100%" fill="url(#grid-default)" />
            </svg>
             <svg className="absolute -bottom-16 -right-16 w-80 h-80 text-green-400/5 dark:text-green-400/10" viewBox="0 0 200 200" fill="currentColor">
               <circle cx="100" cy="100" r="100" />
            </svg>
          </>
        )}
      </>
    )
  },
  {
    id: 'nature',
    name: 'Nature',
    bgClass: 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950',
    borderClass: 'border-emerald-200/50 dark:border-emerald-700/50',
    textClass: 'text-emerald-900 dark:text-emerald-50',
    accentColor: 'text-teal-600 dark:text-teal-400',
    renderDecorations: (isBack) => (
      <>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-emerald-600/5 dark:text-emerald-400/10" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        {!isBack && (
           <svg className="absolute top-4 right-4 w-12 h-12 text-teal-500/10" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
           </svg>
        )}
      </>
    )
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bgClass: 'bg-gradient-to-br from-orange-50 to-rose-100 dark:from-orange-950 dark:to-rose-950',
    borderClass: 'border-orange-200/50 dark:border-orange-700/50',
    textClass: 'text-rose-900 dark:text-rose-50',
    accentColor: 'text-orange-600 dark:text-orange-400',
    renderDecorations: (isBack) => (
      <>
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        {isBack && (
           <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
             <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" fill="none" />
             <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" fill="none" />
           </svg>
        )}
      </>
    )
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bgClass: 'bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-950 dark:to-blue-950',
    borderClass: 'border-sky-200/50 dark:border-sky-700/50',
    textClass: 'text-blue-900 dark:text-sky-50',
    accentColor: 'text-sky-600 dark:text-sky-400',
    renderDecorations: () => (
      <>
        <svg className="absolute inset-0 w-full h-full text-blue-500/5" viewBox="0 0 100 100" preserveAspectRatio="none">
           <pattern id="waves" width="50" height="10" patternUnits="userSpaceOnUse">
             <path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="currentColor" strokeWidth="1"/>
           </pattern>
           <rect width="100%" height="100%" fill="url(#waves)" />
        </svg>
      </>
    )
  },
  {
    id: 'lavender',
    name: 'Lavender',
    bgClass: 'bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950 dark:to-fuchsia-950',
    borderClass: 'border-violet-200/50 dark:border-violet-700/50',
    textClass: 'text-violet-900 dark:text-fuchsia-50',
    accentColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    renderDecorations: () => (
      <>
         <svg className="absolute -top-10 -left-10 w-40 h-40 text-fuchsia-400/10" viewBox="0 0 200 200" fill="currentColor">
            <path d="M42.7,-62.9C50.9,-52.8,49.3,-34.4,52.2,-18.6C55.1,-2.8,62.5,10.4,60.2,22.1C57.9,33.8,45.9,44,32.9,50.7C19.9,57.4,5.9,60.6,-8.7,61.9C-23.3,63.2,-38.5,62.6,-49.4,54.8C-60.3,47,-66.9,32,-68.8,16.8C-70.7,1.6,-67.9,-13.8,-59.1,-26.3C-50.3,-38.8,-35.5,-48.4,-21.3,-53.4C-7.1,-58.4,6.5,-58.8,19.9,-56.9" transform="translate(100 100)" />
         </svg>
         <svg className="absolute -bottom-10 -right-10 w-40 h-40 text-violet-400/10" viewBox="0 0 200 200" fill="currentColor">
            <path d="M38.1,-49.9C49.9,-44.1,60.4,-34.4,65.3,-22.6C70.2,-10.8,69.5,3.1,64.2,14.9C58.9,26.7,49,36.4,38.3,44.2C27.6,52,16.1,57.9,3.5,53.8C-9.1,49.7,-22.8,35.6,-33.5,23.3C-44.2,11,-51.9,0.5,-50.7,-9.4C-49.5,-19.3,-39.4,-28.6,-28.8,-34.8C-18.2,-41,-7.1,-44.1,5.2,-50.3C17.5,-56.5,35,-65.8,38.1,-49.9Z" transform="translate(100 100)" />
         </svg>
      </>
    )
  }
];

export function getSkinForCard(cardId: number | undefined): CardSkin {
  if (!cardId) return cardSkins[0];
  const skinIndex = cardId % cardSkins.length;
  return cardSkins[skinIndex];
}
