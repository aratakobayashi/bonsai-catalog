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
  // サイトの機能（site-tools.ts）用
  question: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01" /></>,
  gift: <><rect x="3.5" y="8.5" width="17" height="4" rx=".5" /><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5C10.5 5 7 5 7.5 7.2 7.8 8.5 12 8.5 12 8.5ZM12 8.5c1.5-3.5 5-3.5 4.5-1.3-.3 1.3-4.5 1.3-4.5 1.3Z" /></>,
  bonsai: <><path d="M5 15.5h14l-1.5 4.5h-11Z" /><path d="M12 15.5v-4c0-1.5-1-2.5-2.5-3M12 11.5c1-1.2 2.3-1.8 4-1.8" /><path d="M6 8.5c0-1.7 1.6-3 3.5-3s3.5 1.3 3.5 3H6ZM12.5 9.7c0-1.6 1.5-2.8 3.3-2.8 1.8 0 3.2 1.2 3.2 2.8h-6.5Z" /></>,
  scissors: <><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="M8.3 15.7 17 4M15.7 15.7 7 4" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M8 12.5c0-2.5 1.8-4.3 4.5-4.5-.2 2.7-2 4.5-4.5 4.5Zm0 0 2-2" /></>,
  check: <><rect x="4.5" y="3.5" width="15" height="17" rx="1" /><path d="m8 9 1.5 1.5L12 8M8 15l1.5 1.5L12 14M14 9.5h2.5M14 15.5h2.5" /></>,
  book: <><path d="M4 5.5c2.7-1 5.3-1 8 .5v14c-2.7-1.5-5.3-1.5-8-.5ZM20 5.5c-2.7-1-5.3-1-8 .5v14c2.7-1.5 5.3-1.5 8-.5Z" /></>,
  note: <><path d="M6 3.5h10.5L19 6v14.5H6Z" /><path d="M9 8.5h7M9 12h7M9 15.5h4" /><path d="M4 7h3M4 11h3M4 15h3" /></>,
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
