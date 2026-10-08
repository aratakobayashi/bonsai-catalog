import Link from 'next/link'
import {
  ENJOY_OPTIONS,
  FLAG_OPTIONS,
  LEVEL_OPTIONS,
  PLACE_OPTIONS,
  SEASON_OPTIONS,
  USE_OPTIONS,
  PRICE_PRESETS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  SPECIES_OPTIONS,
  TYPE_OPTIONS,
  buildCatalogUrl,
  type CatalogFilters,
} from '@/lib/catalog'

const selectClass = 'mt-1 w-full border border-line rounded-lg px-2 py-2 text-sm bg-white text-ink'
const labelClass = 'text-xs font-bold text-ink-soft'

// JavaScript なしで動く絞り込みフォーム（GET 送信で URL に条件が入る）
export function CatalogFiltersForm({ filters, basePath = '/products' }: { filters: CatalogFilters; basePath?: string }) {
  return (
    <form action={basePath} className="bg-white rounded-xl border border-line p-4 space-y-4">
      <div>
        <label className={labelClass} htmlFor="catalog-q">キーワード</label>
        <input
          id="catalog-q"
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="例：五葉松 ミニ、信楽焼 鉢"
          className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <fieldset>
        <legend className={labelClass}>目的から選ぶ</legend>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <OptionSelect label="置き場所" name="place" value={filters.place} options={PLACE_OPTIONS} />
          <OptionSelect label="楽しみ方" name="enjoy" value={filters.enjoy} options={ENJOY_OPTIONS} />
          <OptionSelect label="見ごろの季節" name="season" value={filters.season} options={SEASON_OPTIONS} />
          <OptionSelect label="育てやすさ" name="level" value={filters.level} options={LEVEL_OPTIONS} />
          <OptionSelect label="用途" name="use" value={filters.use} options={USE_OPTIONS} />
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">
          置き場所・楽しみ方・見ごろ・育てやすさは、樹種ごとの一般的な目安と販売店の表記をもとに判定しています。松やもみじなど多くの盆栽は屋外向きです。
        </p>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>種類</span>
          <select name="type" defaultValue={filters.type ?? ''} className={selectClass}>
            <option value="">すべて</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>樹種・分類</span>
          <select name="species" defaultValue={filters.species ?? ''} className={selectClass}>
            <option value="">すべて</option>
            {SPECIES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>サイズ</span>
          <select name="size" defaultValue={filters.size ?? ''} className={selectClass}>
            <option value="">すべて</option>
            {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>ショップ</span>
          <select name="shop" defaultValue={filters.shop ?? ''} className={selectClass}>
            <option value="">すべて</option>
            <option value="rakuten">楽天市場</option>
            <option value="amazon">Amazon</option>
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>価格（下限・円）</span>
          <input type="number" name="min" min={0} step={100} defaultValue={filters.min} className={selectClass} />
        </label>
        <label className="block">
          <span className={labelClass}>価格（上限・円）</span>
          <input type="number" name="max" min={0} step={100} defaultValue={filters.max} className={selectClass} />
        </label>
      </div>

      <fieldset>
        <legend className={labelClass}>こだわり条件（販売店の表記より）</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {FLAG_OPTIONS.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" name="flag" value={o.value} defaultChecked={filters.flags.includes(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">
          販売店の商品名に記載がある商品です。実際の条件は各商品ページでご確認ください。
        </p>
      </fieldset>

      <label className="block">
        <span className={labelClass}>並び順</span>
        <select name="sort" defaultValue={filters.sort} className={selectClass}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-bold">
          この条件で探す
        </button>
        <Link href={basePath} className="px-3 py-2.5 text-sm text-ink-soft border border-line rounded-lg hover:bg-paper">
          クリア
        </Link>
      </div>

      <div>
        <p className={labelClass}>価格帯から選ぶ</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRICE_PRESETS.map(preset => (
            <Link
              key={preset.label}
              href={buildCatalogUrl(filters, { min: preset.min, max: preset.max }, basePath)}
              className="text-xs bg-paper border border-line rounded-full px-3 py-1 hover:border-gold"
            >
              {preset.label}
            </Link>
          ))}
        </div>
      </div>
    </form>
  )
}

function OptionSelect({
  label,
  name,
  value,
  options,
}: {
  label: string
  name: string
  value: string | undefined
  options: readonly { value: string; label: string }[]
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select name={name} defaultValue={value ?? ''} className={selectClass}>
        <option value="">指定なし</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

export function CatalogPagination({
  filters,
  page,
  totalPages,
  basePath = '/products',
}: {
  filters: CatalogFilters
  page: number
  totalPages: number
  basePath?: string
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  )
  return (
    <nav className="flex flex-wrap justify-center items-center gap-2 mt-8" aria-label="ページ送り">
      {page > 1 && (
        <Link href={buildCatalogUrl(filters, { page: page - 1 }, basePath)} className="px-3 py-2 border border-line rounded-lg bg-white text-sm">
          前へ
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-gray-400">…</span>}
          <Link
            href={buildCatalogUrl(filters, { page: p }, basePath)}
            aria-current={p === page ? 'page' : undefined}
            className={`px-3 py-2 border rounded-lg text-sm ${p === page ? 'bg-navy text-white border-navy' : 'bg-white border-line'}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={buildCatalogUrl(filters, { page: page + 1 }, basePath)} className="px-3 py-2 border border-line rounded-lg bg-white text-sm">
          次へ
        </Link>
      )}
    </nav>
  )
}
