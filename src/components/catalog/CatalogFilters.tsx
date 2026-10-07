import Link from 'next/link'
import {
  FLAG_OPTIONS,
  PRICE_PRESETS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  SPECIES_OPTIONS,
  TYPE_OPTIONS,
  buildCatalogUrl,
  type CatalogFilters,
} from '@/lib/catalog'

const selectClass = 'mt-1 w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white'
const labelClass = 'text-xs font-medium text-gray-600'

// JavaScript なしで動く絞り込みフォーム（GET 送信で URL に条件が入る）
export function CatalogFiltersForm({ filters, basePath = '/products' }: { filters: CatalogFilters; basePath?: string }) {
  return (
    <form action={basePath} className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <div>
        <label className={labelClass} htmlFor="catalog-q">キーワード</label>
        <input
          id="catalog-q"
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="例：五葉松 ミニ、信楽焼 鉢"
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

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
        <legend className={labelClass}>こだわり条件</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {FLAG_OPTIONS.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="flag" value={o.value} defaultChecked={filters.flags.includes(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-gray-500">
          「表記あり」は販売店の商品名に記載がある商品です。実際の条件は各商品ページでご確認ください。
        </p>
      </fieldset>

      <label className="block">
        <span className={labelClass}>並び順</span>
        <select name="sort" defaultValue={filters.sort} className={selectClass}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2 text-sm font-medium">
          この条件で探す
        </button>
        <Link href={basePath} className="px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
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
              className="text-xs bg-gray-50 border rounded-full px-3 py-1 hover:border-gray-500"
            >
              {preset.label}
            </Link>
          ))}
        </div>
      </div>
    </form>
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
        <Link href={buildCatalogUrl(filters, { page: page - 1 }, basePath)} className="px-3 py-2 border rounded-lg bg-white text-sm">
          前へ
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-gray-400">…</span>}
          <Link
            href={buildCatalogUrl(filters, { page: p }, basePath)}
            aria-current={p === page ? 'page' : undefined}
            className={`px-3 py-2 border rounded-lg text-sm ${p === page ? 'bg-gray-900 text-white border-gray-900' : 'bg-white'}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={buildCatalogUrl(filters, { page: page + 1 }, basePath)} className="px-3 py-2 border rounded-lg bg-white text-sm">
          次へ
        </Link>
      )}
    </nav>
  )
}
