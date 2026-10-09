'use client'

import { useMemo, useState } from 'react'
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
  eventPlaceText,
  mapAppUrl,
  eventPeriodText,
  parseEventDate,
} from '@/components/features/EventShared'
import { GardenMap } from '@/components/gardens/GardenMap'
import { Breadcrumbs, CONTAINER, Placeholder } from '@/components/ui/design'
import { EVENT_VERIFIED_AT, eventPriceText, getEventMeta, isTentativeEvent } from '@/lib/event-display'

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
    ['開催期間', eventPeriodText(event, true)],
    ...(event.venue_name ? [['会場', event.venue_name] as [string, string]] : []),
    ['住所', event.address ? (event.address.startsWith(event.prefecture) ? event.address : `${event.prefecture}${event.address}`) : event.prefecture],
    ['参加費', eventPriceText(event)],
    ...(event.organizer_name ? [['主催', event.organizer_name] as [string, string]] : []),
  ]
  return (
    <dl className="border-t border-line text-[13px]">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[86px_1fr] gap-x-2 border-b border-line py-3.5">
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
      className={`flex h-12 items-center justify-center bg-sumi px-4 text-sm tracking-[0.04em] text-white hover:bg-sumi-light hover:text-white lg:h-14 ${className}`}
    >
      公式サイトを見る　↗
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
  const hasCoords = typeof event.lat === 'number' && typeof event.lng === 'number' && Number.isFinite(event.lat) && Number.isFinite(event.lng)
  // 地図のピン（再描画のたびに地図の位置が戻らないよう、同じ配列を使い回す）
  const mapPoints = useMemo(
    () => (hasCoords ? [{ id: event.id, name: event.venue_name || event.title, lat: event.lat!, lng: event.lng!, area: eventPlaceText(event) }] : []),
    [event, hasCoords]
  )
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

  const linkClass = 'border-b border-ink pb-0.5 hover:text-gold-dark'
  const notice =
    status === 'past' ? (
      <><strong className="font-bold text-ink">このイベントは終了しました。</strong>次回の日程は公式サイトでご確認ください。</>
    ) : tentative ? (
      <><strong className="font-bold text-ink">今回の日程はまだ発表されていません。</strong>例年の開催時期をもとに掲載しています。日程は公式発表をご確認ください。</>
    ) : status === 'ongoing' ? (
      <><strong className="font-bold text-ink">現在開催中です。</strong>開催時間などは公式サイトでご確認ください。</>
    ) : null

  return (
    <div className={`${CONTAINER} pb-28 lg:pb-16`}>
      <div className="pt-4 lg:pt-6">
        <Link href="/events" className="text-[13px] text-ink-soft hover:text-gold-dark lg:hidden">‹ イベント一覧</Link>
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

      <div className="mt-4 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
        {/* メインカラム */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-x-3">
            {event.types.map(type => <EventTypeTag key={type} type={type} />)}
            <EventStatusTag event={event} />
          </div>
          <h1 className="mt-2 font-mincho text-[28px] font-bold leading-snug tracking-[0.06em] text-ink lg:mt-3 lg:text-[48px] lg:leading-tight">{event.title}</h1>
          <p className="mt-2 text-[13px] text-ink-soft lg:mt-3 lg:text-[15px]">
            {eventPeriodText(event, true)}
            {event.venue_name && <span className="hidden lg:inline">・{event.venue_name}</span>}
          </p>

          {notice && (
            <p className="mt-5 border-b border-t border-b-line border-t-ink py-4 text-[13.5px] leading-relaxed text-ink-soft lg:mt-7">{notice}</p>
          )}

          {/* SP：開催情報 */}
          <div className="mt-5 lg:hidden">
            <InfoRows event={event} />
            {calendarUrl && (
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-block text-[13px] text-ink ${linkClass}`}>
                カレンダーに追加
              </a>
            )}
          </div>

          {event.description && (
            <p className="mt-6 whitespace-pre-line text-[14.5px] leading-[2] text-ink-soft lg:mt-8 lg:text-[15px]">{event.description}</p>
          )}

          {/* 会場 */}
          <section className="mt-8 lg:mt-12" aria-labelledby="event-venue">
            <h2 id="event-venue" className="mb-3 font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-xl">会場</h2>
            {hasCoords ? (
              <div className="isolate h-[220px] overflow-hidden border border-line lg:h-[300px]">
                <GardenMap
                  points={mapPoints}
                  showPopup={false}
                />
              </div>
            ) : null}
            <div className={`${hasCoords ? 'mt-3' : ''} flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13px]`}>
              <span className="text-ink">{event.venue_name || event.prefecture}</span>
              {event.address && <span className="text-ink-muted">{event.address}</span>}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`hidden text-ink lg:ml-auto lg:inline ${linkClass}`}>
                地図アプリで開く
              </a>
            </div>
          </section>

          {/* 関連記事（開催案内・レポート・まとめ） */}
          {eventArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-xl">関連記事</h2>
              <div className="mt-3 flex gap-6 border-b border-line" role="tablist">
                {RELATION_TABS.map(tab => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'py-2.5 font-mincho text-[14px] font-bold',
                      activeTab === tab.key ? 'text-ink shadow-[inset_0_-1.5px_0_#22201c]' : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    {tab.label}
                    {articlesGrouped[tab.key].length > 0 && <span className="ml-1 opacity-70">{articlesGrouped[tab.key].length}</span>}
                  </button>
                ))}
              </div>
              <div>
                {articlesGrouped[activeTab].length > 0 ? (
                  articlesGrouped[activeTab].map(eventArticle => (
                    <div key={eventArticle.id} className="border-b border-line py-4">
                      <h3 className="font-mincho font-bold text-ink">{eventArticle.article?.title || 'タイトルなし'}</h3>
                      {eventArticle.article?.content && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{eventArticle.article.content}</p>}
                      <p className="mt-2 text-xs text-ink-muted">{new Date(eventArticle.created_at).toLocaleDateString('ja-JP')}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-ink-muted">
                    {RELATION_TABS.find(t => t.key === activeTab)?.label}の記事はまだありません
                  </p>
                )}
              </div>
            </section>
          )}

          {/* 掲載情報について */}
          <section className="mt-12 border-t border-line pt-5 text-xs leading-relaxed text-ink-soft">
            <h2 className="text-[13px] font-bold text-ink">掲載情報について</h2>
            <p className="mt-1.5">
              {meta && verifiedText
                ? `${verifiedText}時点で、主催者・公式の情報をもとに確認した内容です。`
                : '掲載内容は公開時点の情報です。'}
              日程・料金・会場は変更されることがあります。お出かけ前に必ず公式サイトでご確認ください。
            </p>
            {meta && meta.sources.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {meta.sources.map(src => (
                  <li key={src} className="break-all">
                    出典：
                    <a href={src} target="_blank" rel="noopener noreferrer" className="border-b border-ink-muted hover:text-gold-dark">
                      {(() => { try { const u = new URL(src); return decodeURI(u.hostname + u.pathname) } catch { return src } })()}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 同じ地域のイベント */}
          {otherEvents.length > 0 && (
            <section className="mt-12">
              <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-xl">{event.prefecture}のほかのイベント</h2>
              <div className="mt-3 flex flex-col border-t border-line">
                {otherEvents.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}

          {/* あわせて読みたい */}
          {recommendedArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-xl">あわせて読みたい</h2>
              <div className="mt-3 grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
                {recommendedArticles.slice(0, 4).map(article => (
                  <Link key={article.id} href={`/guides/${article.slug}`} className="group flex items-center gap-3.5 border-b border-line py-3.5">
                    <div className="relative h-[52px] w-[74px] flex-none overflow-hidden">
                      {article.featuredImage?.url ? (
                        <Image src={article.featuredImage.url} alt="" fill sizes="74px" className="object-cover" />
                      ) : (
                        <Placeholder className="h-full w-full" />
                      )}
                    </div>
                    <span className="line-clamp-2 font-mincho text-[14px] font-bold leading-snug text-ink group-hover:text-gold-dark">{article.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* サイドバー */}
        <aside>
          <div className="lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <h2 className="pb-4 font-mincho text-xl font-bold tracking-[0.06em] text-ink">開催情報</h2>
              <InfoRows event={event} />
              <div className="mt-6 space-y-2.5">
                {event.official_url ? (
                  <OfficialButton url={event.official_url} />
                ) : (
                  <p className="text-xs text-ink-muted">公式サイトの情報は掲載していません。</p>
                )}
                {calendarUrl && (
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center border border-ink bg-white text-[13px] text-ink hover:bg-paper-deep">
                    カレンダーに追加
                  </a>
                )}
              </div>
            </div>
            <div className="lg:mt-12">
              <OtherEventLinks event={event} firstTypeLabel={firstType ? EVENT_TYPE_LABEL[firstType] : null} />
            </div>
          </div>
        </aside>
      </div>

      {/* SP：画面下の操作ボタン（下部タブの上に固定） */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex gap-2.5 border-t border-line bg-paper/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-12 items-center justify-center border border-ink bg-white text-sm text-ink ${event.official_url ? 'w-[38%]' : 'flex-1'}`}
        >
          地図アプリ
        </a>
        {event.official_url && (
          <a href={event.official_url} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center bg-sumi text-sm tracking-[0.04em] text-white hover:text-white">
            公式サイト　↗
          </a>
        )}
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
    <nav aria-label="ほかのイベントを探す">
      <h2 className="pb-2.5 text-[11.5px] tracking-[0.04em] text-ink-muted">ほかのイベントを探す</h2>
      <ul className="border-t border-line">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="flex items-center border-b border-line py-3.5 text-[13.5px] text-ink hover:text-gold-dark">
              {link.label}
              <span className="ml-auto text-ink-muted" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
