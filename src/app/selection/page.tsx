import type { Metadata } from 'next'
import { SELECTIONS } from '@/lib/selections'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: '盆栽の特集一覧｜室内・予算・季節・贈り物など目的から選ぶ - 盆栽コレクション',
  description: '室内に置きやすい盆栽、3,000円以下で始める盆栽、紅葉・花・実を楽しむ盆栽、正月飾りや贈り物など、目的に合わせた盆栽の選び方と比較をまとめた特集の一覧です。',
  alternates: { canonical: '/selection' },
}

export default function SelectionIndexPage() {
  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '特集', url: `${SITE_URL}/selection`, position: 2 },
        ]}
      />
      <div className={`${CONTAINER} pb-14`}>
        <PageHeading
          title="目的から選ぶ特集"
          lead="置き場所・予算・季節・贈る相手など、よく探されている条件ごとに選び方と商品をまとめました。"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '特集' }]}
        />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:mt-8 lg:grid-cols-4 lg:gap-5">
          {SELECTIONS.map(selection => <SelectionCard key={selection.slug} selection={selection} />)}
        </div>
      </div>
    </>
  )
}
