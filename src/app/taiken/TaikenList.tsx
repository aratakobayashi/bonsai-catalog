'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { PROGRAM_TYPE_LABEL, TAIKEN_KINDS, TAIKEN_REGIONS, formatCheckedAt, type TaikenKind, type TaikenPlace, type TaikenProgram } from '@/lib/taiken'

// 体験・教室のある盆栽園を、地域ごとに並べる。
// ・公式サイトで料金などを確かめられた園は「詳しいカード」（PCは横長の1行、スマホは縦のカード）
// ・紹介文しかない園は、地域の最後に1行ずつのコンパクトな一覧
// 内容（1回の体験・教室・苔玉など）で絞り込め、料金の安い順にも並べられる。
// 最初の表示（サーバーで作るHTML）ではすべての園を出す（検索エンジンにもすべて見えるように）
// 地域の中は、探されやすい都道府県の順（関東なら東京→埼玉→神奈川…、関西なら京都→大阪…。TAIKEN_REGIONS の並び）

export interface RegionPhoto {
  src: string
  credit?: string
}

type Sort = 'area' | 'price'

export function TaikenList({ places, checkedAt, photos }: { places: TaikenPlace[]; checkedAt: string; photos: Record<string, RegionPhoto> }) {
  const [kind, setKind] = useState<TaikenKind | null>(null)
  const [sort, setSort] = useState<Sort>('area')
  const shown = kind ? places.filter(p => p.kinds.includes(kind)) : places
  const byArea = (r: (typeof TAIKEN_REGIONS)[number]) => (a: TaikenPlace, b: TaikenPlace) => r.prefectures.indexOf(a.prefecture) - r.prefectures.indexOf(b.prefecture)
  const regions = TAIKEN_REGIONS.map(r => {
    const inRegion = shown.filter(p => r.prefectures.includes(p.prefecture))
    const detailed = inRegion.filter(p => p.programs.length > 0).sort((a, b) => (sort === 'price' ? (a.priceMin ?? Infinity) - (b.priceMin ?? Infinity) : 0) || byArea(r)(a, b))
    const others = inRegion.filter(p => p.programs.length === 0).sort(byArea(r))
    return { ...r, detailed, others, total: places.filter(p => r.prefectures.includes(p.prefecture)).length }
  })
  const jump = (key: string) => document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div>
      {/* 絞り込みの帯（1段）：内容のボタン（横にスクロール）＋地域へ移動・並べ替え */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-paper px-4 py-2.5 lg:mx-0 lg:px-0">
        <div className="flex items-center gap-2">
          <div role="group" aria-label="内容で絞り込む" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => setKind(null)} aria-pressed={kind === null} className={chip(kind === null)}>すべて {places.length}</button>
            {TAIKEN_KINDS.map(k => {
              const n = places.filter(p => p.kinds.includes(k.key)).length
              if (n === 0) return null
              return (
                <button key={k.key} type="button" onClick={() => setKind(kind === k.key ? null : k.key)} aria-pressed={kind === k.key} className={chip(kind === k.key)}>
                  {k.short} {n}
                </button>
              )
            })}
          </div>
          <div className="hidden flex-none items-center gap-2 lg:flex">
            <RegionSelect onJump={jump} />
            <SortSelect sort={sort} onChange={setSort} />
          </div>
        </div>
        <div className="mt-2 flex gap-2 lg:hidden">
          <RegionSelect onJump={jump} />
          <SortSelect sort={sort} onChange={setSort} />
        </div>
      </div>
      {kind && <p className="mt-3 text-[12.5px] text-ink-muted">{TAIKEN_KINDS.find(k => k.key === kind)?.label}：{TAIKEN_KINDS.find(k => k.key === kind)?.note}。各園の紹介文と公式サイトの記載をもとに分けています。</p>}

      {regions.map(region => (
        <section key={region.key} id={region.key} aria-labelledby={`region-${region.key}`} className="scroll-mt-[150px] pt-10 lg:scroll-mt-[120px] lg:pt-14">
          {/* 地域の見出し：写真の帯 */}
          <div className="relative -mx-4 overflow-hidden bg-sumi lg:mx-0">
            {photos[region.key] && <Image src={photos[region.key].src} alt="" fill sizes="(max-width: 1023px) 100vw, 1088px" className="object-cover opacity-60" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
            <div className="relative flex min-h-[120px] flex-col justify-end px-4 py-4 text-white lg:min-h-[150px] lg:px-7 lg:py-5">
              <h2 id={`region-${region.key}`} className="font-mincho text-[22px] font-bold tracking-[0.04em] lg:text-[28px]">{region.label}の盆栽体験・教室</h2>
              <p className="mt-1 text-[12.5px] text-white/80">{region.total}か所・{region.hint}</p>
              {photos[region.key]?.credit && <p className="absolute right-3 top-1.5 text-[10px] text-white/50 lg:bottom-1.5 lg:top-auto">写真：{photos[region.key].credit}</p>}
            </div>
          </div>
          {region.detailed.length > 0 && <p className="mt-3 text-[12px] text-ink-muted">料金・時間は{formatCheckedAt(checkedAt)}に各園の公式サイトで確認したものです。変わることがあるので、申し込む前に確かめてください。</p>}

          {region.detailed.length === 0 && region.others.length === 0 ? (
            <p className="mt-4 text-[13.5px] text-ink-muted">この内容に当てはまる園は、この地域にはまだ載っていません。</p>
          ) : (
            <>
              {region.detailed.length > 0 && (
                <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 lg:gap-4">
                  {region.detailed.map(p => <PlaceCard key={p.id} place={p} />)}
                </ul>
              )}
              {region.others.length > 0 && <OtherPlaces places={region.others} />}
            </>
          )}
        </section>
      ))}
    </div>
  )
}

const chip = (active: boolean) =>
  `inline-flex min-h-9 flex-none items-center whitespace-nowrap border px-3 text-[13px] ${active ? 'border-ink bg-ink font-bold text-white' : 'border-line bg-white text-ink hover:border-ink'}`

const selectClass = 'h-9 min-w-0 flex-1 border border-line bg-white px-2 text-[13px] text-ink lg:flex-none'

function RegionSelect({ onJump }: { onJump: (key: string) => void }) {
  return (
    <select aria-label="地域へ移動" className={selectClass} value="" onChange={e => { if (e.target.value) onJump(e.target.value) }}>
      <option value="">地域へ移動</option>
      {TAIKEN_REGIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
    </select>
  )
}

function SortSelect({ sort, onChange }: { sort: Sort; onChange: (s: Sort) => void }) {
  return (
    <select aria-label="並べ替え" className={selectClass} value={sort} onChange={e => onChange(e.target.value as Sort)}>
      <option value="area">並び：地域の順</option>
      <option value="price">並び：料金の安い順</option>
    </select>
  )
}

// 料金の目安（いちばん安い1回の料金）。情報が古い園・料金の書かれていない園は出さない
function PriceBlock({ place }: { place: TaikenPlace }) {
  const cheapest = place.priceMin !== null ? place.programs.find(p => p.priceMin === place.priceMin) : undefined
  if (!cheapest || place.priceMin === null) {
    return <p className="text-[12.5px] leading-snug text-ink-muted">料金は<br className="hidden lg:block" />各体験の欄・公式サイトで</p>
  }
  return (
    <div>
      <p className="text-[11.5px] text-ink-muted">{PROGRAM_TYPE_LABEL[cheapest.type]}</p>
      <p className="font-mincho text-[24px] font-bold leading-none text-ink lg:text-[28px]">
        {place.priceMin.toLocaleString()}<span className="ml-0.5 text-[13px]">円〜</span>
      </p>
      <p className="mt-1 text-[11px] text-ink-muted">税・材料費の扱いは各体験の欄</p>
    </div>
  )
}

function PlaceCard({ place }: { place: TaikenPlace }) {
  const programs = place.programs.slice(0, 3)
  const flags = [
    place.kinds.includes('takehome') && '持ち帰りOK',
    place.kinds.includes('kids') && '子どもOK',
    place.kinds.includes('english') && '英語OK',
  ].filter(Boolean) as string[]
  return (
    <li className="min-w-0 border border-line bg-white lg:grid lg:grid-cols-[230px_minmax(0,1fr)_190px]">
      {/* 園（スマホは料金と横並び） */}
      <div className="flex items-start gap-3 border-b border-line p-4 lg:block lg:border-b-0 lg:border-r lg:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-gold-dark">{place.prefecture}{place.city}</p>
          <h3 className="mt-0.5 font-mincho text-[18px] font-bold leading-snug text-ink">
            <Link href={`/gardens/${place.id}`} className="hover:text-gold-dark">{place.name}</Link>
          </h3>
          {flags.length > 0 && (
            <p className="mt-2 flex flex-wrap gap-1">
              {flags.map(f => <span key={f} className="bg-[#eef3e8] px-1.5 py-px text-[11.5px] font-bold text-[#3f5a2c]">{f}</span>)}
            </p>
          )}
        </div>
        <div className="flex-none text-right lg:hidden"><PriceBlock place={place} /></div>
      </div>

      {/* 体験・教室 */}
      <div className="px-4 pb-1 lg:px-5 lg:py-2">
        <ul className="divide-y divide-line">
          {programs.map(p => <ProgramRow key={`${p.title}-${p.sourceUrl}`} program={p} gardenId={place.id} />)}
        </ul>
        {place.programs.length > programs.length && <p className="pb-2 text-[12px] text-ink-muted">ほかに{place.programs.length - programs.length}つの体験・教室があります（公式サイト）</p>}
        {place.note && <p className="mb-3 border-l-2 border-gold bg-gold-light px-2.5 py-1.5 text-[12px] leading-[1.6] text-ink">{place.note}</p>}
      </div>

      {/* 料金（PC）と行き先 */}
      <div className="flex items-center gap-x-4 border-t border-line px-4 py-1 lg:flex-col lg:items-stretch lg:justify-between lg:border-l lg:border-t-0 lg:p-5">
        <div className="hidden lg:block"><PriceBlock place={place} /></div>
        <div className="flex flex-wrap gap-x-4 text-[13px] lg:mt-4 lg:flex-col lg:gap-1.5">
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer" data-garden-out={place.id} className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark lg:min-h-10 lg:justify-center lg:border lg:border-ink lg:no-underline lg:hover:bg-ink lg:hover:text-white">
              公式サイト<span aria-hidden="true">&nbsp;↗</span>
            </a>
          )}
          <Link href={`/gardens/${place.id}`} className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark lg:min-h-9 lg:justify-center">所在地・地図</Link>
          {place.omiya && <Link href="/gardens/omiya-bonsai-village" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark lg:min-h-9 lg:justify-center">大宮盆栽村の歩き方</Link>}
        </div>
      </div>
    </li>
  )
}

// 確認した体験・教室の1行：種類と名前、内容、料金・時間・日程（見出し付きで並べる）
function ProgramRow({ program: p, gardenId }: { program: TaikenProgram; gardenId: string }) {
  const rows = [
    ['料金', p.price],
    ['時間', p.duration],
    ['日程', p.schedule],
  ].filter(([, v]) => v) as [string, string][]
  return (
    <li className="py-3">
      <p className="flex items-baseline gap-2">
        <span className="flex-none bg-sumi px-1.5 text-[10.5px] leading-[1.7] text-white">{PROGRAM_TYPE_LABEL[p.type]}</span>
        <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" data-garden-out={gardenId} data-garden-out-type="taiken" className="min-w-0 text-[14.5px] font-bold leading-snug text-ink hover:text-gold-dark">{p.title}</a>
      </p>
      {p.content && <p className="mt-1 text-[12.5px] leading-[1.7] text-ink-soft">{p.content}</p>}
      {rows.length > 0 && (
        <dl className="mt-1.5 grid grid-cols-[2.5em_minmax(0,1fr)] gap-x-2 gap-y-0.5 text-[12.5px] leading-[1.65]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-muted">{k}</dt>
              <dd className={k === '料金' ? 'font-bold text-ink' : 'text-ink-soft'}>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {p.kids && <p className="mt-0.5 text-[12px] text-ink-muted">子ども：{p.kids}</p>}
    </li>
  )
}

// 紹介文しかない園：1行ずつのコンパクトな一覧
function OtherPlaces({ places }: { places: TaikenPlace[] }) {
  return (
    <div className="mt-5">
      <p className="text-[13px] font-bold text-ink">ほかに体験・教室のある園（{places.length}）</p>
      <p className="mt-0.5 text-[12px] text-ink-muted">公式サイトに体験・教室の詳しい案内が見つからなかった園です。内容は電話や公式サイトで確かめてください。</p>
      <ul className="mt-2 border-t border-line">
        {places.map(p => (
          <li key={p.id} className="border-b border-line">
            <Link href={`/gardens/${p.id}`} className="group flex min-h-[56px] items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mincho text-[15.5px] font-bold text-ink group-hover:text-gold-dark">{p.name}</span>
                  <span className="text-[12px] text-ink-muted">{p.prefecture}{p.city}</span>
                </span>
                {p.summary && <span className="mt-0.5 line-clamp-1 block text-[12.5px] text-ink-soft">{p.summary}</span>}
              </span>
              <span className="text-ink-muted" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
