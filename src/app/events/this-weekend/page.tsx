import type { Metadata } from 'next'
import Link from 'next/link'
import type { Event } from '@/types'
import { supabaseServer } from '@/lib/supabase-server'
import { isTentativeEvent } from '@/lib/event-display'
import { SITE_URL } from '@/lib/site'
import { heroPhoto } from '@/lib/hero-photo'
import { WeekendEvents } from '@/components/events/WeekendEvents'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, PageHeading } from '@/components/ui/design'

// 今週末・近くの盆栽展（/events/this-weekend）。「盆栽展 今週末」「盆栽展 近く」で探す人向け
// 3週間先までの日程の決まったイベントを渡し、週末の計算と並び替えはブラウザで行う
export const metadata: Metadata = {
  title: '今週末の盆栽展｜近くで開かれる盆栽の展示会・即売会を探す - 盆栽コレクション',
  description: '今週末と来週末に開かれる盆栽展・小品盆栽展・即売会を、地域や現在地から近い順に探せます。日程・会場・入場料は各イベントのページで確認できます。',
  alternates: { canonical: '/events/this-weekend' },
}

export const revalidate = 3600

async function getSoonEvents(): Promise<Event[]> {
  const today = new Date(Date.now() + 9 * 3600 * 1000)
  const from = new Date(today.getTime() - 86400000).toISOString().slice(0, 10)
  const to = new Date(today.getTime() + 21 * 86400000).toISOString().slice(0, 10)
  const { data, error } = await supabaseServer.from('events').select('*').gte('end_date', from).lte('start_date', to).order('start_date')
  if (error) throw error
  return ((data || []) as Event[]).filter(e => !isTentativeEvent(e))
}

export default async function ThisWeekendPage() {
  const events = await getSoonEvents().catch(() => [] as Event[])
  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽イベント', url: `${SITE_URL}/events`, position: 2 },
          { name: '今週末の盆栽展', url: `${SITE_URL}/events/this-weekend`, position: 3 },
        ]}
      />
      <PageHeading
        eyebrow="出かける"
        photo={heroPhoto('/images/articles/photos/bonsai-club-beginner-guide-2.jpg', '盆栽展の会場で作品を見る人')}
        title="今週末の盆栽展"
        lead="今週末と来週末に開かれる盆栽展・即売会を、地域や現在地から近い順に探せます。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: 'イベント', href: '/events' }, { label: '今週末の盆栽展' }]}
      />
      <div className="mt-6 lg:mt-8">
        <WeekendEvents events={events} builtAt={Date.now()} />
      </div>
      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/events" className="inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">これからの盆栽イベントをすべて見る ›</Link>
        <Link href="/events/autumn-winter-2026" className="inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">秋冬の盆栽展カレンダー ›</Link>
        <Link href="/gardens" className="inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">近くの盆栽園を探す ›</Link>
      </div>
      <p className="mt-6 text-[11.5px] leading-[1.8] text-ink-muted">日程・会場・入場料は、主催者の発表などをもとに掲載しています。変更されることがあるため、お出かけ前に各イベントの公式情報をご確認ください。</p>
    </div>
  )
}
