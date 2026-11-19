'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PROGRAM_TYPE_LABEL, TAIKEN_KINDS, TAIKEN_REGIONS, formatCheckedAt, type TaikenKind, type TaikenPlace, type TaikenProgram } from '@/lib/taiken'

// 体験・教室のある盆栽園を、地域ごとに並べる。内容（1回の体験・教室・苔玉など）で絞り込める
// 最初の表示（サーバーで作るHTML）ではすべての園を出す（検索エンジンにもすべて見えるように）
// 地域の中は、探されやすい都道府県の順（関東なら東京→埼玉→神奈川…、関西なら京都→大阪…。TAIKEN_REGIONS の並び）
export function TaikenList({ places, checkedAt }: { places: TaikenPlace[]; checkedAt: string }) {
  const [kind, setKind] = useState<TaikenKind | null>(null)
  const [byPrice, setByPrice] = useState(false)
  const shown = kind ? places.filter(p => p.kinds.includes(kind)) : places
  // 並び：探されやすい都道府県の順。「料金の安い順」では、料金の分かる園を安い順に先に出す
  const order = (r: (typeof TAIKEN_REGIONS)[number]) => (a: TaikenPlace, b: TaikenPlace) =>
    byPrice
      ? (a.priceMin ?? Infinity) - (b.priceMin ?? Infinity) || r.prefectures.indexOf(a.prefecture) - r.prefectures.indexOf(b.prefecture)
      : r.prefectures.indexOf(a.prefecture) - r.prefectures.indexOf(b.prefecture) || Number(b.programs.length > 0) - Number(a.programs.length > 0)
  const regions = TAIKEN_REGIONS.map(r => ({ ...r, places: shown.filter(p => r.prefectures.includes(p.prefecture)).sort(order(r)) }))
  const anyPrice = places.some(p => p.priceMin !== null)

  return (
    <div>
      {/* 内容で絞り込む */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-paper px-4 py-3 lg:mx-0 lg:px-0">
        <p className="text-[12px] text-ink-muted" id="taiken-kind-label">内容で絞り込む</p>
        <div role="group" aria-labelledby="taiken-kind-label" className="mt-1.5 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap">
          <button type="button" onClick={() => setKind(null)} aria-pressed={kind === null} className={chip(kind === null)}>すべて（{places.length}）</button>
          {TAIKEN_KINDS.map(k => {
            const n = places.filter(p => p.kinds.includes(k.key)).length
            if (n === 0) return null
            return (
              <button key={k.key} type="button" onClick={() => setKind(kind === k.key ? null : k.key)} aria-pressed={kind === k.key} className={chip(kind === k.key)}>
                {k.label}（{n}）
              </button>
            )
          })}
        </div>
        {anyPrice && (
          <label className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={byPrice} onChange={e => setByPrice(e.target.checked)} className="h-4 w-4 accent-[#22201c]" />
            料金の安い順に並べる
          </label>
        )}
      </div>
      {kind && <p className="mt-3 text-[12.5px] text-ink-muted">{TAIKEN_KINDS.find(k => k.key === kind)?.note}。各園の紹介文と公式サイトの記載をもとに分けています。</p>}

      {regions.map(region => (
        <section key={region.key} id={region.key} aria-labelledby={`region-${region.key}`} className="scroll-mt-[260px] pt-10 lg:scroll-mt-[230px] lg:pt-14">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-ink pb-2">
            <h2 id={`region-${region.key}`} className="font-mincho text-[21px] font-bold tracking-[0.04em] text-ink lg:text-[25px]">{region.label}の盆栽体験・教室</h2>
            <span className="text-[12.5px] text-ink-muted">{region.places.length}か所・{region.hint}</span>
          </div>
          {region.places.length === 0 ? (
            <p className="mt-4 text-[13.5px] text-ink-muted">この内容に当てはまる園は、この地域にはまだ載っていません。</p>
          ) : (
            <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {region.places.map(p => <PlaceCard key={p.id} place={p} checkedAt={checkedAt} />)}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

const chip = (active: boolean) =>
  `inline-flex min-h-10 flex-none items-center border px-3.5 text-[13px] ${active ? 'border-ink bg-ink font-bold text-white' : 'border-line bg-white text-ink hover:border-ink'}`

function PlaceCard({ place, checkedAt }: { place: TaikenPlace; checkedAt: string }) {
  const programs = place.programs.slice(0, 3)
  return (
    <li className="flex min-w-0 flex-col border border-line bg-white p-4">
      <p className="text-[12px] text-gold-dark">{place.prefecture}{place.city}</p>
      <h3 className="mt-0.5 font-mincho text-[17px] font-bold leading-snug text-ink">
        <Link href={`/gardens/${place.id}`} className="hover:text-gold-dark">{place.name}</Link>
      </h3>
      <p className="mt-2 flex flex-wrap gap-1.5">
        {place.kinds.length > 0
          ? TAIKEN_KINDS.filter(k => place.kinds.includes(k.key)).map(k => (
              <span key={k.key} className="border border-line bg-paper px-1.5 py-px text-[11.5px] text-ink-soft">{k.short}</span>
            ))
          : <span className="border border-line bg-paper px-1.5 py-px text-[11.5px] text-ink-soft">体験・教室</span>}
      </p>
      {programs.length > 0 ? (
        <>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {programs.map(p => <ProgramRow key={`${p.title}-${p.sourceUrl}`} program={p} />)}
          </ul>
          {place.programs.length > programs.length && <p className="mt-1.5 text-[12px] text-ink-muted">ほかに{place.programs.length - programs.length}つの体験・教室があります</p>}
          {place.note && <p className="mt-2 border-l-2 border-gold bg-gold-light px-2.5 py-1.5 text-[12px] leading-[1.6] text-ink">{place.note}</p>}
          <p className="mt-2 text-[11.5px] leading-[1.6] text-ink-muted">{formatCheckedAt(checkedAt)}に公式サイトで確認。変わることがあるので、申し込む前に確かめてください。</p>
        </>
      ) : (
        place.summary && <p className="mt-2 text-[13px] leading-[1.75] text-ink-soft">{place.summary}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-[13px]">
        <Link href={`/gardens/${place.id}`} className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">所在地・地図</Link>
        {place.website && (
          <a href={place.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">
            公式サイト<span aria-hidden="true">&nbsp;↗</span>
          </a>
        )}
        {place.omiya && <Link href="/gardens/omiya-bonsai-village" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">大宮盆栽村の歩き方</Link>}
      </div>
    </li>
  )
}

// 確認した体験・教室の1行：名前・種類、料金・時間・日程、持ち帰り・子ども・英語
function ProgramRow({ program: p }: { program: TaikenProgram }) {
  const facts = [p.price, p.duration, p.schedule].filter(Boolean) as string[]
  const flags = [p.takeHome === true && '持ち帰りOK', p.kids && `子ども：${p.kids}`, p.english === true && '英語OK'].filter(Boolean) as string[]
  return (
    <li className="py-2.5">
      <p className="flex items-baseline gap-2">
        <span className="flex-none border border-gold/60 px-1 text-[10.5px] leading-[1.5] text-gold-dark">{PROGRAM_TYPE_LABEL[p.type]}</span>
        <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 text-[14px] font-bold leading-snug text-ink hover:text-gold-dark">{p.title}</a>
      </p>
      {p.content && <p className="mt-1 text-[12.5px] leading-[1.7] text-ink-soft">{p.content}</p>}
      {facts.length > 0 && <p className="mt-1 text-[12.5px] leading-[1.7] text-ink">{facts.join('　')}</p>}
      {flags.length > 0 && <p className="mt-0.5 text-[12px] leading-[1.7] text-gold-dark">{flags.join('・')}</p>}
    </li>
  )
}
