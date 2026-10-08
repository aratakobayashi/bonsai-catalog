import type { Metadata } from 'next'
import Link from 'next/link'
import {
  buildCatalogUrl,
  filterProducts,
  getCatalogProducts,
  parseFilters,
  type CatalogFilters,
} from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { PrDisclosure } from '@/components/ui/PrDisclosure'

interface ShindanPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

const QUESTIONS = [
  {
    name: 'who',
    title: '1. どなたが育てますか？',
    options: [
      { value: 'first', label: '自分用（盆栽ははじめて）' },
      { value: 'self', label: '自分用（育てたことがある）' },
      { value: 'gift', label: '贈り物にしたい' },
    ],
  },
  {
    name: 'place',
    title: '2. どこに置きますか？',
    options: [
      { value: 'indoor', label: '室内' },
      { value: 'outdoor', label: 'ベランダ・庭' },
      { value: 'any', label: 'まだ決めていない' },
    ],
  },
  {
    name: 'budget',
    title: '3. ご予算は？',
    options: [
      { value: '3000', label: '〜3,000円' },
      { value: '6000', label: '3,000〜6,000円' },
      { value: '10000', label: '6,000〜10,000円' },
      { value: 'high', label: '10,000円以上' },
      { value: 'any', label: '決めていない' },
    ],
  },
  {
    name: 'enjoy',
    title: '4. 何を楽しみたいですか？',
    options: [
      { value: 'flower', label: '花' },
      { value: 'leaf_color', label: '紅葉・新緑' },
      { value: 'fruit', label: '実' },
      { value: 'evergreen', label: '一年中の緑（松など）' },
      { value: 'any', label: 'おまかせ' },
    ],
  },
] as const

type Answers = Partial<Record<(typeof QUESTIONS)[number]['name'], string>>

const BUDGET_RANGE: Record<string, { min?: number; max?: number }> = {
  '3000': { max: 3000 },
  '6000': { min: 3000, max: 6000 },
  '10000': { min: 6000, max: 10000 },
  high: { min: 10000 },
}

// 診断ページそのものは検索結果に出し、回答後の結果ページは出さない
export function generateMetadata({ searchParams }: ShindanPageProps): Metadata {
  const answered = QUESTIONS.some(q => searchParams[q.name])
  return {
    title: 'かんたん盆栽診断｜4つの質問であなたに合う盆栽を探す - 盆栽コレクション',
    description: '置き場所・予算・楽しみ方など4つの質問に答えるだけで、楽天市場とAmazonの盆栽から合いそうな商品を探せます。はじめての方や贈り物選びにも。',
    alternates: { canonical: '/shindan' },
    ...(answered && { robots: { index: false, follow: true } }),
  }
}

function answersToFilters(answers: Answers): CatalogFilters {
  const budget = BUDGET_RANGE[answers.budget ?? ''] ?? {}
  return {
    ...parseFilters({}),
    type: 'tree',
    place: answers.place === 'indoor' || answers.place === 'outdoor' ? answers.place : undefined,
    enjoy: answers.enjoy && answers.enjoy !== 'any' ? (answers.enjoy as CatalogFilters['enjoy']) : undefined,
    level: answers.who === 'first' ? 'easy' : undefined,
    use: answers.who === 'gift' ? 'gift' : undefined,
    min: budget.min,
    max: budget.max,
  }
}

// 商品が少ないときは、優先度の低い条件から順にゆるめる
const RELAX_ORDER: { key: keyof CatalogFilters; label: string }[] = [
  { key: 'use', label: '「贈り物向けの表記」' },
  { key: 'level', label: '「はじめてでも育てやすい」' },
  { key: 'enjoy', label: '「楽しみ方」' },
  { key: 'min', label: '「予算の下限」' },
]

function findResults(all: CatalogProduct[], initial: CatalogFilters) {
  let filters = initial
  const relaxed: string[] = []
  let results = filterProducts(all, filters)
  for (const step of RELAX_ORDER) {
    if (results.length >= 4) break
    if (!filters[step.key]) continue
    filters = { ...filters, [step.key]: undefined }
    relaxed.push(step.label)
    results = filterProducts(all, filters)
  }
  return { filters, relaxed, results }
}

export default async function ShindanPage({ searchParams }: ShindanPageProps) {
  const answers: Answers = {}
  QUESTIONS.forEach(q => {
    const value = searchParams[q.name]
    const v = Array.isArray(value) ? value[0] : value
    if (v && q.options.some(o => o.value === v)) answers[q.name] = v
  })
  const complete = QUESTIONS.every(q => answers[q.name])
  const result = complete ? findResults(await getCatalogProducts(), answersToFilters(answers)) : null

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">ホーム</Link>
          <span className="mx-2">›</span>
          <span>かんたん盆栽診断</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">かんたん盆栽診断</h1>
          <p className="text-gray-700">4つの質問に答えると、楽天市場とAmazonの盆栽から合いそうな商品を探します。</p>
        </header>

        <form action="/shindan" className="bg-white rounded-xl shadow-sm p-4 md:p-6 space-y-6">
          {QUESTIONS.map(question => (
            <fieldset key={question.name}>
              <legend className="font-semibold text-gray-900 mb-2">{question.title}</legend>
              <div className="flex flex-wrap gap-2">
                {question.options.map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name={question.name}
                      value={option.value}
                      defaultChecked={answers[question.name] === option.value}
                      required
                      className="peer sr-only"
                    />
                    <span className="inline-block border rounded-full px-4 py-2 text-sm text-gray-700 bg-white peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-gray-400">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button type="submit" className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-8 py-3 font-medium">
            {complete ? 'この回答でもう一度探す' : '診断する'}
          </button>
        </form>

        {result && (
          <section className="mt-8" id="result">
            <h2 className="text-xl font-bold text-gray-900 mb-2">診断結果：{result.results.length.toLocaleString()}件の盆栽が見つかりました</h2>
            {answers.place === 'indoor' && (
              <p className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                室内で育てやすいのは、ガジュマルなど寒さに弱い一部の樹種です。松やもみじなど多くの盆栽は屋外向きなので、室内に飾るのは数日程度を目安にしましょう。
              </p>
            )}
            {result.relaxed.length > 0 && (
              <p className="text-sm text-gray-700 mb-3">
                条件に合う商品が少なかったため、{result.relaxed.join('・')}の条件を外して探しました。
              </p>
            )}
            <PrDisclosure className="mb-4" />
            {result.results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {result.results.slice(0, 12).map((product, index) => (
                    <CatalogProductCard key={product.id} product={product} priority={index < 2} />
                  ))}
                </div>
                {result.results.length > 12 && (
                  <div className="text-center mt-6">
                    <Link href={buildCatalogUrl(result.filters)} className="inline-block bg-gray-900 text-white rounded-lg px-6 py-3 text-sm">
                      この条件ですべて見る（{result.results.length.toLocaleString()}件）
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <p className="bg-white rounded-xl p-6 text-gray-700">
                条件に合う商品が見つかりませんでした。予算や置き場所を変えてお試しください。
              </p>
            )}
            <p className="text-xs text-gray-500 mt-6">
              置き場所・楽しみ方・育てやすさは、樹種ごとの一般的な目安と販売店の表記をもとに判定しています。価格・在庫は各ショップの商品ページでご確認ください。
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
