import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import EventsPageClient from './EventsPageClient'
import { getEvents } from '@/lib/events'
import { EventCard } from '@/components/features/EventCard'
import { getEventStatus } from '@/components/features/EventShared'
import type { Event } from '@/types'
import EventViewTabs, { EventViewTabsView } from './EventViewTabs'
import { Breadcrumbs, CONTAINER } from '@/components/ui/design'

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

      <div className={`${CONTAINER} pb-12`}>
        {/* SPのみ：盆栽園／イベントの切り替え */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 lg:hidden">
          <Link href="/gardens" className="rounded-lg border border-line bg-white py-2 text-center text-[13px] text-ink">盆栽園</Link>
          <span className="rounded-lg bg-navy py-2 text-center text-[13px] font-bold text-white" aria-current="page">イベント</span>
        </div>

        <div className="pt-4 lg:pt-10">
          <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '出かける', href: '/gardens' }, { label: 'イベント' }]} className="hidden lg:block" />
          <div className="flex items-center gap-4 lg:mt-2 lg:items-end lg:gap-6">
            <div className="min-w-0">
              <h1 className="font-mincho text-2xl font-bold leading-snug text-navy lg:text-4xl">盆栽イベント</h1>
              <p className="mt-1.5 hidden text-[14.5px] leading-relaxed text-ink-soft lg:block">
                全国の展示会・即売会・ワークショップ・講習会を、これから開催の順に。
              </p>
            </div>
            <div className="ml-auto flex-none">
              <Suspense fallback={<EventViewTabsView active="list" />}>
                <EventViewTabs />
              </Suspense>
            </div>
          </div>
        </div>

        {/* 一覧を組み立てるまでの間も、サーバーで作ったこれからのイベントを表示する（表示を速くするため） */}
        <Suspense fallback={
          <div className="min-h-[100vh] space-y-3 pt-2 lg:max-w-[560px]">
            {upcoming.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        }>
          <EventsPageClient initialEvents={initial?.events} />
        </Suspense>

        <p className="mt-10 text-center text-xs leading-relaxed text-ink-muted">
          盆栽イベントの掲載をご希望の主催者の方は、<Link href="/contact" className="text-navy underline hover:text-gold-dark">お問い合わせ</Link>からご連絡ください。
        </p>
      </div>
    </>
  )
}