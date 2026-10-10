import type { Metadata } from 'next'
import Link from 'next/link'
import { SELECTIONS } from '@/lib/selections'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/site'
import { getCatalogProducts } from '@/lib/catalog'
import { isFeaturable, orderSelectionsBySeason, selectionCounts } from '@/components/selection/selection-meta'
import { SelectionThumb } from '@/components/selection/SelectionThumb'
import { currentMonth } from '@/components/home/seasonal'

// 掲載件数は商品データから数えるため、1時間ごとに再生成（ISR）
// 商品データの取得が一時的に失敗したときの表示が長く残らないよう、10分ごとに作り直す
export const revalidate = 600

export const metadata: Metadata = {
  title: '盆栽の特集一覧｜室内・予算・季節・贈り物など目的から選ぶ - 盆栽コレクション',
  description: '室内に置きやすい盆栽、3,000円以下で始める盆栽、紅葉・花・実を楽しむ盆栽、正月飾りや贈り物など、目的に合わせた盆栽の選び方と比較をまとめた特集の一覧です。',
  alternates: { canonical: '/selection' },
}

export default async function SelectionIndexPage() {
  const counts = selectionCounts(await getCatalogProducts().catch(() => []))
  // 掲載商品が少ない特集は一覧の下に小さく並べる
  // 今月の特集を先頭に
  const month = currentMonth()
  const featured = orderSelectionsBySeason(SELECTIONS.filter(s => isFeaturable(s, counts)), month)
  const [lead, ...rest] = featured
  const minor = SELECTIONS.filter(s => !isFeaturable(s, counts) && (counts.get(s.slug) ?? 0) > 0)
  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '特集', url: `${SITE_URL}/selection`, position: 2 },
        ]}
      />
      <div className={`${CONTAINER} pb-14 lg:pb-20`}>
        <PageHeading
          title="目的から選ぶ特集"
          lead="置き場所・予算・季節・贈る相手など、よく探されている条件ごとに選び方と商品をまとめました。"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '特集' }]}
        />
        {/* 今月の特集（写真を大きく、PC は右に説明） */}
        {lead && (
          <Link href={`/selection/${lead.slug}`} className="group mt-6 block border-t border-line pt-6 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:pt-10">
            <span className="relative -mx-4 block aspect-[40/21] overflow-hidden bg-ink lg:mx-0">
              <SelectionThumb selection={lead} priority sizes="(max-width: 1023px) 100vw, 680px" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
            </span>
            <span className="mt-4 block lg:mt-0">
              <span className="inline-block bg-gold px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-white">{month}月のおすすめ</span>
              <span className="mt-3 block font-mincho text-[22px] font-bold leading-snug tracking-[0.06em] text-ink group-hover:text-gold-dark lg:text-[30px]">{lead.shortTitle}</span>
              <span className="mt-2 block text-[13.5px] leading-[1.9] text-ink-soft lg:mt-3 lg:text-[15px]">{lead.lead}</span>
              <span className="mt-4 inline-flex min-h-11 items-center gap-3 border-b border-ink text-[13.5px] text-ink">
                選び方と商品を見る
                {(counts.get(lead.slug) ?? 0) > 0 && <span className="text-ink-muted">{counts.get(lead.slug)}件</span>}
                <span aria-hidden="true">›</span>
              </span>
            </span>
          </Link>
        )}

        {/* そのほかの特集（SP は1列で写真を大きく、PC は3列） */}
        <h2 className="mt-12 font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:mt-20 lg:text-[22px]">すべての特集</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-8 border-t border-line pt-6 sm:grid-cols-2 sm:gap-x-5 lg:mt-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12 lg:pt-8">
          {rest.map(selection => (
            <SelectionCard key={selection.slug} selection={selection} count={counts.get(selection.slug)} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px" />
          ))}
        </div>
        {minor.length > 0 && (
          <div className="mt-10 lg:mt-14">
            <h2 className="text-xs tracking-[0.08em] text-ink-muted">掲載商品を準備中の特集</h2>
            <ul className="mt-2 border-t border-line text-[13px]">
              {minor.map(selection => (
                <li key={selection.slug} className="border-b border-line">
                  <Link href={`/selection/${selection.slug}`} className="flex min-h-11 items-center gap-3 py-2 text-ink-soft hover:text-ink">
                    {selection.shortTitle}
                    <span className="text-[11px] text-ink-muted">{counts.get(selection.slug)}件</span>
                    <span className="ml-auto text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-12 text-[13px] text-ink-soft lg:mt-16">
          条件がまだ決まっていないときは{' '}
          <Link href="/shindan" className="inline-flex min-h-11 items-center text-ink"><span className="border-b border-ink pb-0.5">かんたん盆栽診断（4つの質問）</span></Link>
        </p>
      </div>
    </>
  )
}
