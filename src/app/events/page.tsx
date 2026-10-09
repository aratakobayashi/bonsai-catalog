import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import EventsPageClient from './EventsPageClient'
import { getEvents } from '@/lib/events'
import { EventListView } from '@/components/features/EventListView'
import { EventFiltersPlaceholder } from '@/components/features/EventFilters'
import { getEventStatus } from '@/components/features/EventShared'
import type { Event } from '@/types'
import { EventViewTabsView } from './EventViewTabs'
import { CONTAINER, PageHeading } from '@/components/ui/design'

export const metadata: Metadata = {
  alternates: { canonical: '/events' },
  title: '盆栽イベント情報 | 展示会・即売会・ワークショップ一覧',
  description: '全国の盆栽イベント情報をカレンダー形式で掲載。展示会、即売会、ワークショップ、講習会など様々なイベントを地域・開催日・種別で検索できます。',
  keywords: [
    '盆栽イベント', '盆栽展示会', '盆栽即売会', 'ワークショップ',
    '盆栽講習会', '国風盆栽展', '大宮盆栽まつり', 'イベント情報',
    '盆栽体験', '盆栽教室', '展示', '即売', '講習'
  ],
  openGraph: {
    title: '盆栽イベント情報 | 展示会・即売会・ワークショップ一覧',
    description: '全国の盆栽イベント情報をカレンダー形式で掲載。展示会、即売会、ワークショップ、講習会など様々なイベントを地域・開催日・種別で検索できます。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '盆栽イベント情報',
    description: '全国の盆栽イベント情報をお届け',
  },
}

// 一覧は1時間ごとに作り直す（イベントの反映時にも作り直される）
export const revalidate = 3600

// 盆栽園／イベントの切り替え（明朝の文字タブ）
const toggle = (
  <nav aria-label="出かける" className="flex gap-5 lg:justify-end lg:gap-7">
    <Link href="/gardens" className="pb-1.5 font-mincho text-[15px] font-bold text-ink-muted hover:text-ink lg:text-base">盆栽園</Link>
    <span className="pb-1.5 font-mincho text-[15px] font-bold text-ink shadow-[inset_0_-1.5px_0_#22201c] lg:text-base" aria-current="page">イベント</span>
  </nav>
)

export default async function EventsPage() {
  const initial = await getEvents({ page: 1, limit: 1000 }).catch(() => null)
  const upcoming = ((initial?.events ?? []) as Event[])
    .filter(event => getEventStatus(event) !== 'past')
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 12)
  return (
    <>
      {/* JSON-LD for Events */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "盆栽イベント情報",
            "description": "全国の盆栽イベント情報をカレンダー形式で掲載",
            "url": "https://www.bonsai-collection.com/events",
            "mainEntity": {
              "@type": "ItemList",
              "name": "盆栽イベント一覧",
              "description": "展示会、即売会、ワークショップ、講習会などの盆栽関連イベント"
            }
          })
        }}
      />

      <div className={`${CONTAINER} pb-14`}>
        {/* SPは見出しの上に切り替え */}
        <div className="pt-5 lg:hidden">{toggle}</div>
        <PageHeading
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '出かける', href: '/gardens' }, { label: 'イベント' }]}
          title="盆栽イベント"
          lead={
            <>
              <span className="text-xs text-ink-muted lg:hidden">これから開催の順</span>
              <span className="hidden lg:inline">全国の展示会・即売会・ワークショップ・講習会を、これから開催の順に。</span>
            </>
          }
          aside={<div className="hidden lg:block">{toggle}</div>}
        />

        {/* 一覧を組み立てるまでの間も、サーバーで作ったこれからのイベントを表示する（表示を速くするため） */}
        <Suspense fallback={
          <div className="min-h-[100vh]">
            <EventFiltersPlaceholder className="mt-5 lg:mt-9" trailing={<EventViewTabsView active="list" />} />
            <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
              <EventListView events={upcoming} />
            </div>
          </div>
        }>
          <EventsPageClient initialEvents={initial?.events} />
        </Suspense>

        <p className="mt-12 text-xs leading-relaxed text-ink-muted">
          盆栽イベントの掲載をご希望の主催者の方は、<Link href="/contact" className="border-b border-ink-muted hover:text-gold-dark">お問い合わせ</Link>からご連絡ください。
        </p>
      </div>
    </>
  )
}
