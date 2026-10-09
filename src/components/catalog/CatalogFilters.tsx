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

const selectClass = 'mt-1 h-11 w-full border border-line bg-white px-2 text-sm text-ink'
const labelClass = 'text-[11.5px] tracking-[0.06em] text-ink-muted'

// JavaScript なしで動く絞り込みフォーム（GET 送信で URL に条件が入る）
export function CatalogFiltersForm({ filters, basePath = '/products' }: { filters: CatalogFilters; basePath?: string }) {
  return (
    <form action={basePath} className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="catalog-q">キーワード</label>
        <input
          id="catalog-q"
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="例：五葉松 ミニ、信楽焼 鉢"
          className="mt-1 h-11 w-full border border-line bg-white px-3 text-sm"
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
            <label key={o.value} className="flex min-h-[36px] items-center gap-2 text-sm text-ink">
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
        <button type="submit" className="h-12 flex-1 bg-sumi text-sm tracking-[0.06em] text-white hover:bg-sumi-light">
          この条件で探す
        </button>
        <Link href={basePath} className="flex h-12 items-center border border-line px-4 text-sm text-ink-soft hover:border-ink">
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
              className="border border-line bg-white px-3 py-1.5 text-xs text-ink hover:border-ink"
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
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="ページ送り">
      {page > 1 && (
        <Link href={buildCatalogUrl(filters, { page: page - 1 }, basePath)} className="border border-line bg-white px-3 py-2 text-sm text-ink hover:border-ink">
          前へ
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-ink-muted">…</span>}
          <Link
            href={buildCatalogUrl(filters, { page: p }, basePath)}
            aria-current={p === page ? 'page' : undefined}
            className={`min-w-[40px] border px-3 py-2 text-center text-sm ${p === page ? 'border-sumi bg-sumi text-white hover:text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={buildCatalogUrl(filters, { page: page + 1 }, basePath)} className="border border-line bg-white px-3 py-2 text-sm text-ink hover:border-ink">
          次へ
        </Link>
      )}
    </nav>
  )
}
