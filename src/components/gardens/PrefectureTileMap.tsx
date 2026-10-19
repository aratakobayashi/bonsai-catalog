import Link from 'next/link'
import { prefectureAreaHref } from '@/lib/prefectures'

// 日本の都道府県のタイル地図（[列, 行]。地方の並びが分かる程度に形を単純にしたもの）
const TILES: [string, number, number][] = [
  ['北海道', 11, 0], ['青森県', 10, 1], ['秋田県', 9, 2], ['岩手県', 10, 2], ['山形県', 9, 3], ['宮城県', 10, 3],
  ['石川県', 6, 4], ['富山県', 7, 4], ['新潟県', 8, 4], ['福島県', 9, 4],
  ['福井県', 5, 5], ['岐阜県', 6, 5], ['長野県', 7, 5], ['群馬県', 8, 5], ['栃木県', 9, 5], ['茨城県', 10, 5],
  ['島根県', 2, 6], ['鳥取県', 3, 6], ['京都府', 4, 6], ['滋賀県', 5, 6], ['愛知県', 6, 6], ['山梨県', 7, 6], ['埼玉県', 8, 6], ['千葉県', 9, 6],
  ['山口県', 1, 7], ['広島県', 2, 7], ['岡山県', 3, 7], ['兵庫県', 4, 7], ['奈良県', 5, 7], ['静岡県', 6, 7], ['神奈川県', 7, 7], ['東京都', 8, 7],
  ['佐賀県', 0, 8], ['福岡県', 1, 8], ['大分県', 2, 8], ['大阪府', 4, 8], ['三重県', 5, 8],
  ['長崎県', 0, 9], ['熊本県', 1, 9], ['宮崎県', 2, 9], ['愛媛県', 3, 9], ['香川県', 4, 9], ['和歌山県', 5, 9],
  ['鹿児島県', 1, 10], ['高知県', 3, 10], ['徳島県', 4, 10],
  ['沖縄県', 0, 11],
]

// 園の数で濃さを変える（墨色の帯の上と、紙色の上の2通り）
const TONES = {
  dark: { high: 'bg-[#8db86a] text-[#16210f]', mid: 'bg-[#5f8a45] text-white', low: 'bg-[#3e5a30] text-white/90', none: 'bg-white/[0.06] text-white/35', outline: 'hover:outline-[#d6ba84]', current: 'outline outline-2 outline-[#d6ba84]', legendText: 'text-white/70' },
  light: { high: 'bg-[#4f7a3a] text-white', mid: 'bg-[#7fa565] text-white', low: 'bg-[#c9dbb8] text-[#24361a]', none: 'bg-paper-deep text-ink-muted/60', outline: 'hover:outline-ink', current: 'outline outline-2 outline-ink', legendText: 'text-ink-muted' },
}

function tone(t: (typeof TONES)['dark'], n: number): string {
  return n >= 8 ? t.high : n >= 4 ? t.mid : n >= 1 ? t.low : t.none
}

// 都道府県のタイル地図。園のある県のタイルは県のページ（/gardens/area/〇〇）へのリンク。画像やスクリプトは使わない
export function PrefectureTileMap({ counts, variant = 'light', current, className = '' }: { counts: Map<string, number>; variant?: 'dark' | 'light'; current?: string; className?: string }) {
  const t = TONES[variant]
  return (
    <div className={className}>
      <div className="grid grid-cols-12 gap-[3px] lg:gap-1" style={{ gridTemplateRows: 'repeat(12, minmax(0, 1fr))' }}>
        {TILES.map(([pref, col, row]) => {
          const n = counts.get(pref) ?? 0
          const label = pref === '北海道' ? '北海道' : pref.replace(/[都府県]$/, '')
          const style = { gridColumnStart: col + 1, gridRowStart: row + 1 }
          const cls = `flex aspect-square items-center justify-center text-center text-[9px] leading-[1.1] tracking-[-0.02em] sm:text-[11px] ${tone(t, n)} ${pref === current ? t.current : ''}`
          return n > 0 ? (
            <Link key={pref} href={prefectureAreaHref(pref)} style={style} title={`${pref}の盆栽園（${n}件）`} aria-current={pref === current ? 'page' : undefined} className={`${cls} hover:outline hover:outline-2 ${t.outline}`}>
              {label}
            </Link>
          ) : (
            <span key={pref} style={style} className={cls} aria-hidden="true">{label}</span>
          )
        })}
      </div>
      <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] ${t.legendText}`}>
        <span className="flex items-center gap-1.5"><i className={`inline-block h-3 w-3 ${t.low.split(' ')[0]}`} />1〜3園</span>
        <span className="flex items-center gap-1.5"><i className={`inline-block h-3 w-3 ${t.mid.split(' ')[0]}`} />4〜7園</span>
        <span className="flex items-center gap-1.5"><i className={`inline-block h-3 w-3 ${t.high.split(' ')[0]}`} />8園以上</span>
      </div>
    </div>
  )
}
