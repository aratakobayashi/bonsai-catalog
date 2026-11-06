import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

// 樹種ごとの価格帯の図（グラフの部品を使わず、HTML と CSS だけで描く）
// 帯：よくある価格帯（下から25%〜75%）、丸：中央値。価格は1,000円〜10万円の対数の目盛り（安い樹と高い樹を同じ図で見比べるため）

export interface PriceRangeRow {
  slug: string
  name: string
  group: string | null
  count: number
  median: number
  low: number
  high: number
  href: string
}

const MIN = 1000
const MAX = 100000
const TICKS = [1000, 3000, 10000, 30000, 100000]
const pos = (price: number) => {
  const clamped = Math.min(Math.max(price, MIN), MAX)
  return ((Math.log10(clamped) - Math.log10(MIN)) / (Math.log10(MAX) - Math.log10(MIN))) * 100
}
const tickLabel = (n: number) => (n >= 10000 ? `${n / 10000}万円` : `${n.toLocaleString()}円`)

export function PriceRangeChart({ rows }: { rows: PriceRangeRow[] }) {
  return (
    <div>
      {/* 凡例 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-ink-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-6 rounded-full bg-gold/45" aria-hidden="true" />よくある価格帯（中央の半分）</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-paper bg-sumi" aria-hidden="true" />中央値</span>
        <span>目盛りは安い価格ほど広い（対数）</span>
      </div>

      {/* 目盛り（PC は名前の列のぶん右へずらす） */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)_96px] lg:gap-x-5">
        <div className="hidden lg:block" />
        <div className="relative h-5 text-[10.5px] text-ink-muted" aria-hidden="true">
          {TICKS.map(t => (
            <span key={t} className="absolute top-0 -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full" style={{ left: `${pos(t)}%` }}>{tickLabel(t)}</span>
          ))}
        </div>
        <div className="hidden lg:block" />
      </div>

      <ul className="border-t border-line">
        {rows.map(row => (
          <li key={row.slug} className="border-b border-line">
            <Link
              href={row.href}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 lg:grid-cols-[180px_minmax(0,1fr)_96px] lg:gap-x-5 lg:py-3.5"
              aria-label={`${row.name}：中央値${formatPrice(row.median)}、よくある価格帯${formatPrice(row.low)}〜${formatPrice(row.high)}（${row.count}件）`}
            >
              {/* 名前 */}
              <span className="min-w-0">
                <span className="block truncate font-mincho text-[15px] font-bold text-ink group-hover:text-gold-dark">{row.name}</span>
                <span className="block text-[11px] text-ink-muted">{[row.group, `${row.count}件`].filter(Boolean).join('・')}</span>
              </span>
              {/* SP：中央値は名前の右に */}
              <span className="text-right lg:hidden">
                <span className="block text-[15px] font-bold text-ink">{formatPrice(row.median)}</span>
                <span className="block text-[10.5px] text-ink-muted">中央値</span>
              </span>
              {/* 帯 */}
              <span className="relative col-span-2 block h-4 lg:col-span-1" aria-hidden="true">
                {TICKS.map(t => (
                  <span key={t} className="absolute inset-y-0 w-px bg-line" style={{ left: `${pos(t)}%` }} />
                ))}
                <span
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gold/45 transition-colors group-hover:bg-gold/70"
                  style={{ left: `${pos(row.low)}%`, width: `${Math.max(pos(row.high) - pos(row.low), 1.5)}%` }}
                />
                <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-sumi" style={{ left: `${pos(row.median)}%` }} />
              </span>
              {/* PC：中央値と価格帯は右の列に */}
              <span className="hidden text-right lg:block">
                <span className="block text-[15px] font-bold text-ink">{formatPrice(row.median)}</span>
                <span className="block whitespace-nowrap text-[10.5px] text-ink-muted">{formatPrice(row.low)}〜{formatPrice(row.high)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
