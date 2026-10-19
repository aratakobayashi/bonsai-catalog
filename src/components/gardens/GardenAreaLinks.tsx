import Link from 'next/link'
import { PREFECTURE_ORDER, REGION_ORDER } from '@/components/gardens/GardenParts'
import { getRegionFromPrefecture } from '@/lib/utils'
import { prefectureAreaHref, prefectureSlug } from '@/lib/prefectures'
import { PrefectureTileMap } from './PrefectureTileMap'

// 都道府県ごとのまとめページ（/gardens/area/〇〇）への案内。左に都道府県のタイル地図、右に地方ごとの一覧（園のある都道府県だけ）
export function GardenAreaLinks({ gardens, current, title = '都道府県ごとの盆栽園', className = '' }: { gardens: { prefecture?: string | null }[]; current?: string; title?: string; className?: string }) {
  const counts = new Map<string, number>()
  gardens.forEach(g => { if (g.prefecture && prefectureSlug(g.prefecture)) counts.set(g.prefecture, (counts.get(g.prefecture) ?? 0) + 1) })
  const regions = REGION_ORDER.map(region => ({
    region,
    prefectures: PREFECTURE_ORDER.filter(p => getRegionFromPrefecture(p) === region && counts.has(p)),
  })).filter(r => r.prefectures.length > 0)
  if (regions.length === 0) return null
  return (
    <section aria-labelledby="garden-areas" className={className}>
      <h2 id="garden-areas" className="border-t border-ink pt-7 font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:pt-9 lg:text-[22px]">{title}</h2>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-10">
      <PrefectureTileMap counts={counts} current={current} className="w-full max-w-[420px]" />
      <dl className="grid content-start gap-x-8 gap-y-3 sm:grid-cols-2">
        {regions.map(({ region, prefectures }) => (
          <div key={region} className="min-w-0">
            <dt className="text-[11.5px] tracking-[0.08em] text-ink-muted">{region}</dt>
            <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {prefectures.map(p => (
                <Link
                  key={p}
                  href={prefectureAreaHref(p)}
                  aria-current={p === current ? 'page' : undefined}
                  className={`inline-flex min-h-9 items-center text-[13.5px] underline-offset-4 ${p === current ? 'font-bold text-ink' : 'text-ink hover:text-gold-dark hover:underline'}`}
                >
                  {p}<span className="ml-0.5 text-[11px] text-ink-muted">（{counts.get(p)}）</span>
                </Link>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      </div>
    </section>
  )
}
