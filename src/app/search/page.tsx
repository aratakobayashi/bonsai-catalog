import type { Metadata } from 'next'
import Link from 'next/link'
import { searchRakutenItems, type RakutenSort } from '@/lib/rakuten'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { RakutenCredit, RakutenItemGrid } from '@/components/shop/RakutenItemGrid'

// 検索結果ページは検索エンジンに登録しない（一覧ページ /shop/... を登録対象にする）
export const metadata: Metadata = {
  title: '盆栽を検索 - 盆栽コレクション',
  robots: { index: false, follow: true },
}

interface SearchPageProps {
  searchParams: { q?: string; min?: string; max?: string; sort?: string; page?: string }
}

const SORTS: { value: RakutenSort; label: string }[] = [
  { value: 'standard', label: 'おすすめ順' },
  { value: '+itemPrice', label: '価格が安い順' },
  { value: '-itemPrice', label: '価格が高い順' },
  { value: '-reviewCount', label: 'レビューが多い順' },
]

const PRICE_PRESETS = [
  { label: '〜3,000円', min: '', max: '3000' },
  { label: '3,000〜6,000円', min: '3000', max: '6000' },
  { label: '6,000〜10,000円', min: '6000', max: '10000' },
  { label: '10,000円〜', min: '10000', max: '' },
]

const toNumber = (value?: string) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q || '').trim().slice(0, 60)
  const min = toNumber(searchParams.min)
  const max = toNumber(searchParams.max)
  const sort = SORTS.some(s => s.value === searchParams.sort) ? (searchParams.sort as RakutenSort) : 'standard'
  const page = Math.min(toNumber(searchParams.page) ?? 1, 10)

  // 盆栽と無関係な商品が混ざらないよう、「盆栽」を含まない検索語には補う
  const keyword = q && !/盆栽|苔玉|bonsai/i.test(q) ? `${q} 盆栽` : q
  const result = keyword
    ? await searchRakutenItems({ keyword, minPrice: min, maxPrice: max, sort, page, hits: 30 })
    : null

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { q, min: min ? String(min) : '', max: max ? String(max) : '', sort, ...overrides }
    Object.entries(merged).forEach(([key, value]) => {
      if (value && !(key === 'sort' && value === 'standard')) params.set(key, value)
    })
    return `/search?${params}`
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">盆栽を検索</h1>

        <form action="/search" className="bg-white rounded-xl shadow-sm p-4 mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] items-end">
          <label className="block">
            <span className="text-xs text-gray-600">キーワード</span>
            <input type="search" name="q" defaultValue={q} placeholder="例：五葉松 ミニ" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">下限（円）</span>
            <input type="number" name="min" min={0} defaultValue={min} className="mt-1 w-28 border border-gray-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">上限（円）</span>
            <input type="number" name="max" min={0} defaultValue={max} className="mt-1 w-28 border border-gray-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">並び順</span>
            <select name="sort" defaultValue={sort} className="mt-1 border border-gray-300 rounded-lg px-3 py-2">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <button type="submit" className="bg-gray-900 text-white rounded-lg px-5 py-2">検索</button>
        </form>

        <div className="flex flex-wrap gap-2 mb-6 text-sm">
          {PRICE_PRESETS.map(preset => (
            <Link key={preset.label} href={buildQuery({ min: preset.min, max: preset.max, page: undefined })} className="bg-white border rounded-full px-3 py-1 hover:border-gray-500">
              {preset.label}
            </Link>
          ))}
        </div>

        {!result && (
          <div>
            <p className="text-gray-700 mb-3">キーワードを入力するか、カテゴリから探してください。</p>
            <div className="flex flex-wrap gap-2">
              {SHOP_CATEGORIES.map(category => (
                <Link key={category.slug} href={`/shop/${category.slug}`} className="text-sm bg-white border rounded-full px-3 py-1 hover:border-gray-500">
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {result && (
          <>
            <PrDisclosure className="mb-4" />
            {result.items.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  「{keyword}」の楽天市場の商品 {result.total.toLocaleString()}件（{page}ページ目）
                </p>
                <RakutenItemGrid items={result.items} />
                <div className="flex justify-center gap-3 mt-6">
                  {page > 1 && (
                    <Link href={buildQuery({ page: String(page - 1) })} className="bg-white border rounded-lg px-4 py-2">前へ</Link>
                  )}
                  {page < 10 && result.total > page * 30 && (
                    <Link href={buildQuery({ page: String(page + 1) })} className="bg-white border rounded-lg px-4 py-2">次へ</Link>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-700 bg-white rounded-xl p-6">
                {result.error ? '商品情報を取得できませんでした。時間をおいて再度お試しください。' : '条件に合う商品が見つかりませんでした。キーワードや価格の条件を変えてお試しください。'}
              </p>
            )}
            <RakutenCredit />
          </>
        )}
      </div>
    </div>
  )
}
