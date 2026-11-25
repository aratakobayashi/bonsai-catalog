'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { friendlyError, ownerSupabase } from '@/lib/owner-supabase'
import { PageTitle, ownerSubButton, useOwner } from '@/components/owner/OwnerShell'

// 管理画面のホーム：掲載の効果（園のページの表示、公式サイト・通販への移動、電話・地図など）
interface StatRow { day: string; metric: string; source: string; count: number }

const SEND_METRICS = ['website', 'shop', 'taiken', 'instagram', 'product']
const METRIC_LABEL: Record<string, string> = {
  view: '園のページの表示',
  website: '公式サイトへ',
  shop: '通販サイトへ',
  taiken: '体験・教室の案内ページへ',
  instagram: 'Instagramへ',
  product: '商品の購入先へ',
  phone: '電話をかける',
  map: '地図を開く',
}
const SOURCE_LABEL: Record<string, string> = {
  search: '検索（Google など）',
  gardens: '盆栽園の一覧・地域のページ',
  taiken: '盆栽体験・盆栽教室を探す',
  shops: '盆栽園・専門店から直接買う',
  omiya: '大宮盆栽村の歩き方',
  garden: 'ほかの盆栽園のページ',
  home: 'トップページ',
  events: 'イベントのページ',
  guides: '記事',
  english: '英語のページ',
  site: 'サイト内のほかのページ',
  sns: 'SNS',
  external: 'ほかのサイト',
  direct: '直接（ブックマークなど）',
  other: 'そのほか',
}
const PERIODS = [7, 30, 90]

const jstToday = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)
const addDays = (d: string, n: number) => new Date(new Date(`${d}T00:00:00Z`).getTime() + n * 86400e3).toISOString().slice(0, 10)
const fmtDay = (d: string) => { const [, m, day] = d.split('-').map(Number); return `${m}/${day}` }
const fmtDate = (d: string) => { const [y, m, day] = d.split('-').map(Number); return `${y}年${m}月${day}日` }

function change(now: number, before: number) {
  if (!before) return now ? '前の期間は0' : ''
  const pct = Math.round(((now - before) / before) * 100)
  return `前の期間より ${pct >= 0 ? '+' : ''}${pct}%`
}

export default function OwnerHomePage() {
  const { garden } = useOwner()
  const [rows, setRows] = useState<StatRow[] | null>(null)
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState('')
  const [period, setPeriod] = useState(30)
  const today = jstToday()

  useEffect(() => {
    let cancelled = false
    setRows(null)
    setError('')
    const sb = ownerSupabase()
    const from = addDays(today, -179)
    ;(async () => {
      const all: StatRow[] = []
      for (let offset = 0; offset < 20000; offset += 1000) {
        const { data, error: e } = await sb.from('garden_stats_daily').select('day, metric, source, count').eq('garden_id', garden.id).gte('day', from).order('day').range(offset, offset + 999)
        if (e) { if (!cancelled) setError(friendlyError(e.message)); return }
        all.push(...((data ?? []) as StatRow[]))
        if (!data || data.length < 1000) break
      }
      const { data: prod } = await sb.from('garden_products').select('id, name').eq('garden_id', garden.id)
      if (!cancelled) { setRows(all); setProducts((prod ?? []) as { id: string; name: string }[]) }
    })()
    return () => { cancelled = true }
  }, [garden.id, today])

  const view = useMemo(() => {
    if (!rows) return null
    const start = addDays(today, -(period - 1))
    const prevStart = addDays(start, -period)
    const inNow = rows.filter(r => r.day >= start)
    const inPrev = rows.filter(r => r.day >= prevStart && r.day < start)
    const sum = (list: StatRow[], pred: (r: StatRow) => boolean) => list.filter(pred).reduce((n, r) => n + r.count, 0)
    const isSend = (r: StatRow) => SEND_METRICS.includes(r.metric)
    const cards = [
      { label: '園のページの表示', note: 'お客様が貴園のページを見た回数', now: sum(inNow, r => r.metric === 'view'), prev: sum(inPrev, r => r.metric === 'view') },
      { label: '公式サイト・通販・商品へ', note: '貴園のサイトや購入先へ移った回数', now: sum(inNow, isSend), prev: sum(inPrev, isSend) },
      { label: '電話をかける', note: '電話のボタンが押された回数', now: sum(inNow, r => r.metric === 'phone'), prev: sum(inPrev, r => r.metric === 'phone') },
      { label: '地図を開く', note: '地図アプリを開いた回数', now: sum(inNow, r => r.metric === 'map'), prev: sum(inPrev, r => r.metric === 'map') },
    ]
    const days = Array.from({ length: period }, (_, i) => addDays(start, i))
    const daily = days.map(d => ({ day: d, view: sum(inNow, r => r.day === d && r.metric === 'view'), send: sum(inNow, r => r.day === d && isSend(r)) }))
    const maxDaily = Math.max(1, ...daily.map(d => d.view))
    const bySource = new Map<string, number>()
    for (const r of inNow) if (r.metric === 'view') bySource.set(r.source || 'other', (bySource.get(r.source || 'other') ?? 0) + r.count)
    const viewTotal = cards[0].now
    const sources = [...bySource.entries()].sort((a, b) => b[1] - a[1])
    const byMetric = Object.keys(METRIC_LABEL).filter(m => m !== 'view').map(m => ({ metric: m, count: sum(inNow, r => r.metric === m) })).filter(m => m.count > 0)
    const byProduct = products.map(p => ({ ...p, count: sum(inNow, r => r.metric === `product:${p.id}`) })).filter(p => p.count > 0).sort((a, b) => b.count - a.count)
    const firstDay = rows[0]?.day
    return { cards, daily, maxDaily, sources, viewTotal, byMetric, byProduct, start, firstDay, inNow }
  }, [rows, period, today, products])

  const downloadCsv = () => {
    if (!view) return
    const lines = [['日付', '種類', 'どこから', '回数'].join(',')]
    for (const r of view.inNow) {
      const metric = r.metric.startsWith('product:') ? `商品：${products.find(p => `product:${p.id}` === r.metric)?.name ?? r.metric}` : METRIC_LABEL[r.metric] ?? r.metric
      lines.push([r.day, metric, SOURCE_LABEL[r.source] ?? r.source, r.count].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    }
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${garden.name}_${view.start}_${today}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <PageTitle
        title="掲載の効果"
        lead={view ? `${fmtDate(view.start)}〜${fmtDate(today)}（今日の分は途中までの数字です）` : undefined}
        action={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <div className="flex border border-line bg-white" role="group" aria-label="期間">
              {PERIODS.map(p => (
                <button key={p} type="button" onClick={() => setPeriod(p)} aria-pressed={period === p} className={`h-10 px-3.5 text-[13px] ${period === p ? 'bg-ink font-bold text-white' : 'text-ink-soft hover:text-ink'}`}>{p}日</button>
              ))}
            </div>
            <button type="button" onClick={downloadCsv} disabled={!view} className={`${ownerSubButton} !min-h-10 text-[13px]`}>CSV</button>
            <button type="button" onClick={() => window.print()} className={`${ownerSubButton} !min-h-10 text-[13px]`}>印刷・PDF</button>
          </div>
        }
      />

      {error && <p className="mt-6 border border-[#a3412c]/30 bg-white p-4 text-[14px] text-[#a3412c]">{error}</p>}
      {!view && !error && <p className="py-20 text-center text-[14px] text-ink-muted">数字を読み込んでいます…</p>}

      {view && (
        <>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {view.cards.map(c => (
              <li key={c.label} className="border border-line bg-white p-4 lg:p-5">
                <p className="text-[12.5px] font-bold text-ink-soft">{c.label}</p>
                <p className="mt-1 font-mincho text-[30px] font-bold leading-tight lg:text-[36px]">{c.now.toLocaleString()}<span className="ml-1 text-[13px] font-normal text-ink-muted">回</span></p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">{change(c.now, c.prev)}</p>
                <p className="mt-2 text-[11.5px] leading-[1.6] text-ink-muted">{c.note}</p>
              </li>
            ))}
          </ul>

          <section className="mt-6 border border-line bg-white p-4 lg:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-mincho text-[17px] font-bold">日ごとの推移</h2>
              <p className="flex gap-4 text-[12px] text-ink-soft">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-gold/70" />園のページの表示</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-ink" />サイト・通販・商品へ</span>
              </p>
            </div>
            <div className="mt-5 flex h-[180px] items-end gap-[2px] border-b border-line" role="img" aria-label="日ごとの表示回数のグラフ">
              {view.daily.map(d => (
                <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${fmtDay(d.day)}　表示 ${d.view}回・移動 ${d.send}回`}>
                  <div className="w-full bg-gold/70" style={{ height: `${(d.view / view.maxDaily) * 100}%` }} />
                  {d.send > 0 && <div className="absolute bottom-0 left-1/4 w-1/2 bg-ink" style={{ height: `${(d.send / view.maxDaily) * 100}%` }} />}
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-ink-muted">
              <span>{fmtDay(view.daily[0].day)}</span>
              <span>{fmtDay(view.daily[Math.floor(view.daily.length / 2)].day)}</span>
              <span>{fmtDay(view.daily[view.daily.length - 1].day)}</span>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="border border-line bg-white p-4 lg:p-6">
              <h2 className="font-mincho text-[17px] font-bold">どこから見られたか</h2>
              <p className="mt-1 text-[12px] text-ink-muted">園のページを見たお客様が、直前に見ていたところ</p>
              {view.sources.length === 0 ? <p className="mt-5 text-[13.5px] text-ink-muted">この期間の表示はまだありません。</p> : (
                <ul className="mt-4 space-y-2.5">
                  {view.sources.map(([src, n]) => (
                    <li key={src} className="grid grid-cols-[minmax(0,1fr)_minmax(0,40%)_48px] items-center gap-3 text-[13px]">
                      <span className="truncate">{SOURCE_LABEL[src] ?? src}</span>
                      <span className="h-2 bg-paper-deep"><span className="block h-2 bg-ink" style={{ width: `${(n / view.viewTotal) * 100}%` }} /></span>
                      <span className="text-right text-ink-soft">{n.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="border border-line bg-white p-4 lg:p-6">
              <h2 className="font-mincho text-[17px] font-bold">押されたボタン</h2>
              <p className="mt-1 text-[12px] text-ink-muted">当サイトから貴園へつながった回数</p>
              {view.byMetric.length === 0 ? <p className="mt-5 text-[13.5px] text-ink-muted">この期間はまだありません。</p> : (
                <dl className="mt-3 divide-y divide-line">
                  {view.byMetric.map(m => (
                    <div key={m.metric} className="flex justify-between py-2.5 text-[13.5px]"><dt>{METRIC_LABEL[m.metric]}</dt><dd className="font-bold">{m.count.toLocaleString()}回</dd></div>
                  ))}
                </dl>
              )}
              {view.byProduct.length > 0 && (
                <>
                  <h3 className="mt-6 text-[13.5px] font-bold">商品ごとの、購入先へ進んだ回数</h3>
                  <dl className="mt-2 divide-y divide-line">
                    {view.byProduct.map(p => (
                      <div key={p.id} className="flex justify-between gap-3 py-2 text-[13px]"><dt className="truncate">{p.name}</dt><dd className="flex-none font-bold">{p.count}回</dd></div>
                    ))}
                  </dl>
                </>
              )}
            </section>
          </div>

          <div className="mt-8 grid gap-3 text-[13px] leading-[1.8] text-ink-soft sm:grid-cols-2 print:hidden">
            <Link href="/owner/garden" className="border border-line bg-white p-4 hover:border-ink"><b className="text-ink">園の情報を整える ›</b><br />営業時間・体験・写真を新しくすると、見る人が迷わず訪ねられます。</Link>
            <Link href="/owner/products" className="border border-line bg-white p-4 hover:border-ink"><b className="text-ink">商品を載せる ›</b><br />盆栽や道具を載せると、園のページから購入先へご案内します。</Link>
          </div>
          <p className="mt-6 text-[11.5px] leading-[1.8] text-ink-muted">
            {view.firstDay ? `${fmtDate(view.firstDay)}から数えています。` : '数え始めたばかりで、まだ数字がありません。'}
            ロボットによる表示はできるだけ除いていますが、すべては除ききれません。個人を特定する情報は記録していません。
          </p>
        </>
      )}
    </div>
  )
}
