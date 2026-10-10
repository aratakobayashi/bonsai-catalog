// 「症状から調べる」の線のアイコン（CareIcon と同じ太さ・線の書き方）。色は文字色、強調の部分だけ金色
import type { ShojoIconName } from '@/lib/shojo'

const LEAF = 'M12 21c0-6 0-10 0-14M12 21C6 18 4 13 5.5 8 7 4 11 3 12 3c1 0 5 1 6.5 5 1.5 5-.5 10-6.5 13Z'

const PATHS: Record<ShojoIconName, JSX.Element> = {
  'leaf-yellow': (
    <>
      <path d={LEAF} />
      <path d="M12 12l-3-2M12 16l3-2" className="text-gold" stroke="currentColor" />
    </>
  ),
  'leaf-tip': (
    <>
      <path d="M5 20C5 11 10 5 19 4c0 9-5 15-14 16Z" />
      <path d="M5 20 13 12" />
      <path d="M15 4.5c1.5-.3 3-.5 4-.5 0 1-.2 2.5-.5 4" className="text-gold" stroke="currentColor" strokeWidth={2.2} />
    </>
  ),
  wilt: (
    <>
      <path d="M12 21V9c0-2 1-4 3-5" />
      <path d="M15 4c3 1 4 4 3 8-2-1-3.5-3-3-8Z" />
      <path d="M12 12c-2-1-5-.5-6 2 1 2.5 4 3 6 1" />
    </>
  ),
  'leaf-fall': (
    <>
      <path d="M4 4h16" />
      <path d="M8 4v3M16 4v2" />
      <path d="M7 11c2-1 4 0 4 2s-2 3-4 3-2-4 0-5Z" />
      <path d="M15 15c2-.5 3.5 1 3 3s-2.5 2.5-4 2-1-4.5 1-5Z" />
    </>
  ),
  bud: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c-2-1.5-2.5-4.5 0-8 2.5 3.5 2 6.5 0 8Z" />
      <path d="M12 16c-2 0-4-1-5-3M12 17c2 0 4-1 5-3" />
    </>
  ),
  powder: (
    <>
      <path d={LEAF} />
      <circle cx="9" cy="9" r=".8" fill="currentColor" />
      <circle cx="15" cy="10" r=".8" fill="currentColor" />
      <circle cx="10" cy="14" r=".8" fill="currentColor" />
      <circle cx="15" cy="15" r=".8" fill="currentColor" />
    </>
  ),
  bug: (
    <>
      <ellipse cx="12" cy="14" rx="4.5" ry="6" />
      <path d="M12 8V20M9 5l1.5 2.5M15 5l-1.5 2.5M7.5 12H4M7.5 16 4.5 18M16.5 12H20M16.5 16l3 2" />
    </>
  ),
  branch: (
    <>
      <path d="M4 20c4-3 7-7 9-12M13 8l6-4M10 13l-5-2" />
      <path d="M17 12l3 1M13 8l3 6" className="text-gold" stroke="currentColor" strokeDasharray="1.5 2" />
    </>
  ),
  'soil-wet': (
    <>
      <path d="M4 10h16l-2 10H6L4 10Z" />
      <path d="M8 14h1M12 16h1M15 13h1" />
      <path d="M12 2s3 3.3 3 5.5a3 3 0 0 1-6 0C9 5.3 12 2 12 2Z" />
    </>
  ),
  'water-block': (
    <>
      <path d="M4 12h16l-2 8H6l-2-8Z" />
      <path d="M6 12c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 3 0" />
      <path d="M12 2.5s2.5 2.8 2.5 4.6a2.5 2.5 0 0 1-5 0c0-1.8 2.5-4.6 2.5-4.6Z" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="9" r="1.6" className="text-gold" stroke="currentColor" />
      <circle cx="12" cy="5" r="2.4" />
      <circle cx="15.8" cy="7.8" r="2.4" />
      <circle cx="14.4" cy="12.2" r="2.4" />
      <circle cx="9.6" cy="12.2" r="2.4" />
      <circle cx="8.2" cy="7.8" r="2.4" />
      <path d="M12 14.6V21" />
    </>
  ),
  fruit: (
    <>
      <circle cx="9" cy="15" r="4" />
      <circle cx="16" cy="13" r="3.5" />
      <path d="M10 11c0-4 2-6 5-7" />
    </>
  ),
}

export function ShojoIcon({ name, className = 'h-8 w-8' }: { name: ShojoIconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`flex-none ${className}`}>
      {PATHS[name]}
    </svg>
  )
}
