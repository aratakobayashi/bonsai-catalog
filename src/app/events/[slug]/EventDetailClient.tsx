'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Event, EventArticle, Product, Article } from '@/types'
import { cn } from '@/lib/utils'
import { EventCard } from '@/components/features/EventCard'
import {
  EVENT_TYPE_LABEL,
  EventStatusTag,
  EventTypeTag,
  getEventStatus,
  googleCalendarUrl,
  mapAppUrl,
  parseEventDate,
} from '@/components/features/EventShared'
import { Breadcrumbs, CONTAINER, Card, Placeholder } from '@/components/ui/design'
import { EVENT_VERIFIED_AT, eventDateText, eventPriceText, getEventMeta, isTentativeEvent } from '@/lib/event-display'

interface EventDetailClientProps {
  event: Event
  eventArticles: EventArticle[]
  relatedEvents: Event[]
  popularProducts: Product[]
  recommendedArticles: Article[]
}

// 開催情報の表（PCは右カラム、SPは本文の上）
function InfoRows({ event }: { event: Event }) {
  const rows: [string, string][] = [
    ['開催期間', eventDateText(event, true)],
    ...(event.venue_name ? [['会場', event.venue_name] as [string, string]] : []),
    ['住所', event.address ? (event.address.startsWith(event.prefecture) ? event.address : `${event.prefecture}${event.address}`) : event.prefecture],
    ['参加費', eventPriceText(event)],
    ...(event.organizer_name ? [['主催', event.organizer_name] as [string, string]] : []),
  ]
  return (
    <dl className="text-[13.5px]">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[70px_1fr] gap-x-2 border-b border-[#f1ece2] py-2.5">
          <dt className="text-ink-muted">{label}</dt>
          <dd className="leading-relaxed text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function OfficialButton({ url, className = '' }: { url: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex h-11 items-center justify-center rounded-[10px] bg-navy px-4 text-sm font-bold text-white hover:bg-navy-light ${className}`}
    >
      公式サイトで確認する ↗
    </a>
  )
}

const RELATION_TABS = [
  { key: 'announcement', label: '開催案内' },
  { key: 'report', label: 'レポート' },
  { key: 'summary', label: 'まとめ' },
] as const

export default function EventDetailClient({
  event,
  eventArticles,
  relatedEvents,
  recommendedArticles
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'announcement' | 'report' | 'summary'>('announcement')

  const status = getEventStatus(event)
  const tentative = isTentativeEvent(event)
  const meta = getEventMeta(event.slug)
  const calendarUrl = googleCalendarUrl(event)
  const mapUrl = mapAppUrl(event)
  const firstType = event.types[0]

  const articlesGrouped = {
    announcement: eventArticles.filter(ea => ea.relation_type === 'announcement'),
    report: eventArticles.filter(ea => ea.relation_type === 'report'),
    summary: eventArticles.filter(ea => ea.relation_type === 'summary'),
  }

  // 関連イベントはこれから開催のものを先に
  const otherEvents = [...relatedEvents]
    .filter(e => e.id !== event.id)
    .sort((a, b) => Number(getEventStatus(a) === 'past') - Number(getEventStatus(b) === 'past'))
    .slice(0, 3)

  const verifiedText = EVENT_VERIFIED_AT
    ? parseEventDate(EVENT_VERIFIED_AT).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className={`${CONTAINER} pb-12`}>
      <div className="pt-4 lg:pt-8">
        <Link href="/events" className="text-[13px] text-navy hover:text-gold-dark lg:hidden">‹ イベント一覧</Link>
        <Breadcrumbs
          className="hidden lg:block"
          items={[
            { label: 'ホーム', href: '/' },
            { label: '出かける', href: '/gardens' },
            { label: 'イベント', href: '/events' },
            { label: event.title },
          ]}
        />
      </div>

      <div className="mt-3 grid gap-6 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_352px] lg:gap-8">
        {/* メインカラム */}
        <div className="min-w-0 space-y-5">
          <div className="lg:rounded-[14px] lg:border lg:border-line lg:bg-white lg:px-8 lg:py-7">
            <div className="flex flex-wrap gap-1.5">
              {event.types.map(type => <EventTypeTag key={type} type={type} />)}
              <EventStatusTag event={event} />
            </div>
            <h1 className="mt-2.5 font-mincho text-[26px] font-bold leading-snug text-navy lg:text-4xl">{event.title}</h1>
            <p className="mt-1.5 text-[13px] text-ink-soft lg:text-sm">
              {eventDateText(event, true)}
              {event.venue_name && <span className="hidden lg:inline">・{event.venue_name}</span>}
            </p>

            {status === 'past' ? (
              <p className="mt-4 rounded-[10px] bg-[#f1ece2] px-4 py-3 text-[13px] leading-relaxed text-ink">
                <strong>このイベントは終了しました。</strong>次回の日程は公式サイトでご確認ください。
              </p>
            ) : tentative ? (
              <p className="mt-4 rounded-[10px] bg-[#f1ece2] px-4 py-3 text-[13px] leading-relaxed text-ink">
                <strong>今回の日程はまだ発表されていません。</strong>例年の開催時期をもとに掲載しています。日程は公式発表をご確認ください。
              </p>
            ) : status === 'ongoing' ? (
              <p className="mt-4 rounded-[10px] bg-green-50 px-4 py-3 text-[13px] leading-relaxed text-green-800">
                <strong>現在開催中です。</strong>開催時間などは公式サイトでご確認ください。
              </p>
            ) : null}

            {/* SP：開催情報 */}
            <Card className="mt-4 px-4 py-2 lg:hidden">
              <InfoRows event={event} />
              <div className="flex gap-2.5 py-3">
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 flex-[0_0_38%] items-center justify-center rounded-[10px] border border-navy text-sm font-bold text-navy">
                  地図アプリ
                </a>
                {event.official_url ? (
                  <OfficialButton url={event.official_url} className="flex-1" />
                ) : calendarUrl ? (
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 flex-1 items-center justify-center rounded-[10px] bg-navy text-sm font-bold text-white">
                    カレンダーに追加
                  </a>
                ) : null}
              </div>
            </Card>

            {event.description && (
              <p className="mt-5 whitespace-pre-line text-[14.5px] leading-[1.9] text-ink lg:text-[15px]">{event.description}</p>
            )}
          </div>

          {/* 会場 */}
          <Card className="overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Placeholder label={`地図（${event.venue_name || event.prefecture}）`} className="h-40 lg:h-full lg:min-h-[220px]" />
            <div className="px-5 py-5">
              <h2 className="text-sm font-bold text-navy">会場</h2>
              <p className="mt-2 text-sm text-ink">{event.venue_name || event.prefecture}</p>
              {event.address && <p className="mt-0.5 text-[13px] text-ink-soft">{event.address}</p>}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-10 items-center rounded-[10px] border border-navy px-4 text-[13px] font-bold text-navy hover:bg-gold-light">
                地図アプリで開く
              </a>
            </div>
          </Card>

          {/* 関連記事（開催案内・レポート・まとめ） */}
          {eventArticles.length > 0 && (
            <Card className="px-5 py-5 lg:px-6">
              <h2 className="font-mincho text-lg font-bold text-navy">関連記事</h2>
              <div className="mt-3 flex gap-1.5" role="tablist">
                {RELATION_TABS.map(tab => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-[13px]',
                      activeTab === tab.key ? 'bg-navy font-bold text-white' : 'border border-line bg-white text-ink hover:border-gold'
                    )}
                  >
                    {tab.label}
                    {articlesGrouped[tab.key].length > 0 && <span className="ml-1 opacity-70">{articlesGrouped[tab.key].length}</span>}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {articlesGrouped[activeTab].length > 0 ? (
                  articlesGrouped[activeTab].map(eventArticle => (
                    <div key={eventArticle.id} className="rounded-lg border border-line p-4">
                      <h3 className="font-bold text-ink">{eventArticle.article?.title || 'タイトルなし'}</h3>
                      {eventArticle.article?.content && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{eventArticle.article.content}</p>}
                      <p className="mt-2 text-xs text-ink-muted">{new Date(eventArticle.created_at).toLocaleDateString('ja-JP')}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-ink-muted">
                    {RELATION_TABS.find(t => t.key === activeTab)?.label}の記事はまだありません
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* 掲載情報について */}
          <div className="rounded-[14px] border border-line bg-[#fbf9f4] px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
            <h2 className="text-[13px] font-bold text-ink">掲載情報について</h2>
            <p className="mt-1">
              {meta && verifiedText
                ? `${verifiedText}時点で、主催者・公式の情報をもとに確認した内容です。`
                : '掲載内容は公開時点の情報です。'}
              日程・料金・会場は変更されることがあります。お出かけ前に必ず公式サイトでご確認ください。
            </p>
            {meta && meta.sources.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {meta.sources.map(src => (
                  <li key={src} className="truncate">
                    出典：
                    <a href={src} target="_blank" rel="noopener noreferrer" className="text-navy underline hover:text-gold-dark">
                      {(() => { try { const u = new URL(src); return decodeURI(u.hostname + u.pathname) } catch { return src } })()}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* あわせて読みたい */}
          {recommendedArticles.length > 0 && (
            <section>
              <h2 className="font-mincho text-lg font-bold text-navy lg:text-xl">あわせて読みたい</h2>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:gap-3">
                {recommendedArticles.slice(0, 4).map(article => (
                  <Link
                    key={article.id}
                    href={`/guides/${article.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5 hover:border-gold"
                  >
                    <div className="relative h-[52px] w-[74px] flex-none overflow-hidden rounded-md">
                      {article.featuredImage?.url ? (
                        <Image src={article.featuredImage.url} alt="" fill sizes="74px" className="object-cover" />
                      ) : (
                        <Placeholder className="h-full w-full" />
                      )}
                    </div>
                    <span className="line-clamp-2 font-mincho text-[14px] font-bold leading-snug text-ink">{article.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 同じ地域のイベント */}
          {otherEvents.length > 0 && (
            <section>
              <h2 className="font-mincho text-lg font-bold text-navy lg:text-xl">{event.prefecture}のほかのイベント</h2>
              <div className="mt-3 flex flex-col gap-2.5">
                {otherEvents.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}
        </div>

        {/* サイドバー */}
        <aside className="space-y-5">
          <div className="hidden lg:block lg:sticky lg:top-24 lg:space-y-5">
            <Card className="px-6 py-5">
              <h2 className="text-sm font-bold text-navy">開催情報</h2>
              <div className="mt-1">
                <InfoRows event={event} />
              </div>
              <div className="mt-4 space-y-2">
                {event.official_url ? (
                  <OfficialButton url={event.official_url} />
                ) : (
                  <p className="text-xs text-ink-muted">公式サイトの情報は掲載していません。</p>
                )}
                {calendarUrl && (
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center rounded-[10px] border border-navy text-[13px] text-navy hover:bg-gold-light">
                    カレンダーに追加
                  </a>
                )}
              </div>
            </Card>
            <OtherEventLinks event={event} firstTypeLabel={firstType ? EVENT_TYPE_LABEL[firstType] : null} />
          </div>
          <div className="lg:hidden">
            <OtherEventLinks event={event} firstTypeLabel={firstType ? EVENT_TYPE_LABEL[firstType] : null} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function OtherEventLinks({ event, firstTypeLabel }: { event: Event; firstTypeLabel: string | null }) {
  const links = [
    { href: `/events?prefecture=${encodeURIComponent(event.prefecture)}`, label: `${event.prefecture}のイベント` },
    ...(firstTypeLabel ? [{ href: `/events?types=${event.types[0]}`, label: `${firstTypeLabel}のイベント` }] : []),
    { href: '/events', label: 'これから開催のイベント' },
  ]
  return (
    <Card className="px-6 py-5">
      <h2 className="text-sm font-bold text-navy">ほかのイベントを探す</h2>
      <ul className="mt-1.5">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="flex items-center border-b border-[#f1ece2] py-2.5 text-[13.5px] text-ink hover:text-gold-dark">
              {link.label}
              <span className="ml-auto text-ink-muted" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
