import type { Metadata } from 'next'
import Link from 'next/link'
import { SELECTIONS } from '@/lib/selections'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/site'
import { getCatalogProducts } from '@/lib/catalog'
import { isFeaturable, selectionCounts } from '@/components/selection/selection-meta'

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
  const featured = SELECTIONS.filter(s => isFeaturable(s, counts))
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
        <div className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-8 border-t border-line pt-8 md:grid-cols-3 lg:mt-12 lg:gap-x-10 lg:gap-y-12 lg:pt-12">
          {featured.map(selection => <SelectionCard key={selection.slug} selection={selection} count={counts.get(selection.slug)} />)}
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
