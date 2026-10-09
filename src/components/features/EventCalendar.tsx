'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EventCard } from './EventCard'
import { isTentativeEvent } from '@/lib/event-display'
import { parseEventDate } from './EventShared'

interface EventCalendarProps {
  events: Event[]
  className?: string
  viewMode?: 'calendar' | 'list' | 'map'
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// 端末のタイムゾーンでの YYYY-MM-DD
function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function EventCalendar({ events, className }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // 6週間分のグリッド（日曜始まり）
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    return Array.from({ length: 42 }, (_, i) => new Date(currentYear, currentMonth, 1 - firstDay.getDay() + i))
  }, [currentYear, currentMonth])

  // 日付ごとのイベント（日程が未発表のイベントはカレンダーに載せない）
  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {}
    events.filter(event => !isTentativeEvent(event)).forEach(event => {
      const end = parseEventDate(event.end_date)
      for (const d = parseEventDate(event.start_date); d <= end; d.setDate(d.getDate() + 1)) {
        const key = dateKey(d)
        if (!map[key]) map[key] = []
        map[key].push(event)
      }
    })
    return map
  }, [events])

  // その月に開催のあるイベント（日付未選択時に右側に出す）
  const monthEvents = useMemo(() => {
    const first = new Date(currentYear, currentMonth, 1)
    const last = new Date(currentYear, currentMonth + 1, 0)
    return events
      .filter(event => !isTentativeEvent(event))
      .filter(event => parseEventDate(event.start_date) <= last && parseEventDate(event.end_date) >= first)
      .sort((a, b) => parseEventDate(a.start_date).getTime() - parseEventDate(b.start_date).getTime())
  }, [events, currentYear, currentMonth])

  const selectedDateEvents = selectedDate ? eventsByDate[dateKey(selectedDate)] || [] : []
  const todayKey = dateKey(new Date())

  const moveMonth = (diff: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + diff, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const sideEvents = selectedDate ? selectedDateEvents : monthEvents

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]', className)}>
      <div className="border border-line bg-white p-3 lg:p-5">
        {/* 月の切り替え */}
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-mincho text-lg font-bold tracking-[0.04em] text-ink lg:text-xl">{currentYear}年{currentMonth + 1}月</h2>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={goToToday} className="border border-line bg-white px-3 py-1 text-xs text-ink hover:border-ink">今日</button>
            <button onClick={() => moveMonth(-1)} className="p-1.5 text-ink-soft hover:bg-paper-deep" aria-label="前の月">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => moveMonth(1)} className="p-1.5 text-ink-soft hover:bg-paper-deep" aria-label="次の月">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[11px] lg:text-xs">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className={cn('py-1.5', i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-700' : 'text-ink-muted')}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden border border-line bg-line" role="grid" aria-label={`${currentYear}年${currentMonth + 1}月のカレンダー`}>
          {calendarDays.map((date, index) => {
            const key = dateKey(date)
            const dayEvents = eventsByDate[key] || []
            const inMonth = date.getMonth() === currentMonth
            const isSelected = selectedDate ? dateKey(selectedDate) === key : false
            const dow = index % 7

            return (
              <div
                key={key}
                role="gridcell"
                aria-selected={isSelected}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'flex h-16 cursor-pointer flex-col p-1 text-left sm:h-20 lg:h-24 lg:p-1.5',
                  inMonth ? 'bg-white hover:bg-[#fffdf9]' : 'bg-paper text-ink-muted',
                  isSelected && 'bg-paper-deep hover:bg-paper-deep'
                )}
              >
                <button
                  type="button"
                  className={cn(
                    'flex h-6 w-6 items-center justify-center text-xs lg:text-[13px]',
                    key === todayKey && 'bg-sumi font-bold text-white',
                    key !== todayKey && inMonth && (dow === 0 ? 'text-red-600' : dow === 6 ? 'text-blue-700' : 'text-ink')
                  )}
                  aria-label={`${date.getMonth() + 1}月${date.getDate()}日${dayEvents.length ? `（${dayEvents.length}件のイベント）` : ''}`}
                  aria-pressed={isSelected}
                >
                  {date.getDate()}
                </button>
                {dayEvents.length > 0 && (
                  <div className="mt-0.5 min-w-0 flex-1 space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map(event => (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        onClick={e => e.stopPropagation()}
                        className="hidden truncate px-1 py-px text-[11px] text-gold-dark hover:underline sm:block"
                        title={event.title}
                      >
                        {event.title}
                      </Link>
                    ))}
                    <span className="block text-[10px] text-gold-dark sm:hidden">●{dayEvents.length > 1 ? dayEvents.length : ''}</span>
                    {dayEvents.length > 2 && <span className="hidden text-[10px] text-ink-muted sm:block">他{dayEvents.length - 2}件</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[11.5px] text-ink-muted">※ 日程が発表されていない恒例行事はカレンダーに表示していません（リスト表示で確認できます）。</p>
      </div>

      {/* 選択した日（未選択ならその月）のイベント */}
      <div>
        <div className="lg:sticky lg:top-24">
          <h3 className="mb-2.5 flex items-baseline gap-2 text-[13px] font-bold text-ink-soft">
            {selectedDate
              ? `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日（${WEEKDAYS[selectedDate.getDay()]}）のイベント`
              : `${currentMonth + 1}月のイベント`}
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="ml-auto text-xs font-normal border-b border-ink text-ink hover:text-gold-dark">
                月の一覧に戻る
              </button>
            )}
          </h3>
          {sideEvents.length > 0 ? (
            <div className="flex flex-col border-t border-line">
              {sideEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <p className="border border-line bg-white px-4 py-8 text-center text-sm text-ink-soft">
              {selectedDate ? 'この日のイベントはありません' : 'この月のイベントはありません'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
