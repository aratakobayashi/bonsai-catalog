// 商品ページの小さな線のアイコン（育てやすさ・置き場所・見頃・水やりなど）。色は文字色に合わせる
const PATHS: Record<string, JSX.Element> = {
  level: <path d="M12 21c-4-3-7-6.5-7-10.5C5 6.4 8.1 3 12 3s7 3.4 7 7.5c0 4-3 7.5-7 10.5Zm0-14v14" />,
  outdoor: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  indoor: <path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5" />,
  season: <><rect x="3.5" y="5" width="17" height="15" rx="1" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  water: <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z" />,
  place: <><path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  care: <path d="M6 20 18 8M14 4l6 6M4 14l6 6M9 9l6 6" />,
  winter: <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 3.5 12 6l3-2.5M9 20.5l3-2.5 3 2.5" />,
  fruit: <><circle cx="9" cy="15" r="4" /><circle cx="16" cy="13" r="3.5" /><path d="M10 11c0-4 2-6 5-7" /></>,
  size: <path d="M4 20 20 4M4 20v-6M4 20h6M20 4h-6M20 4v6" />,
}

export function CareIcon({ name, className = 'h-[18px] w-[18px]' }: { name: string; className?: string }) {
  const path = PATHS[name] ?? PATHS.care
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`flex-none ${className}`}>
      {path}
    </svg>
  )
}

// 見出しの言葉からアイコンを選ぶ（care-guides.ts の項目名など）
export function iconFor(label: string): string {
  if (/水/.test(label)) return 'water'
  if (/置き場所/.test(label)) return 'place'
  if (/冬/.test(label)) return 'winter'
  if (/実|花/.test(label)) return 'fruit'
  if (/季節|見頃/.test(label)) return 'season'
  if (/育てやすさ/.test(label)) return 'level'
  return 'care'
}
