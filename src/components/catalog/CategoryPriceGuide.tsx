import Link from 'next/link'
import type { CatalogProduct } from '@/lib/catalog-model'
import { SIZE_OPTIONS } from '@/lib/catalog'
import { formatPrice } from '@/lib/utils'

// 樹種・種類のページの「価格の目安と選び方」。掲載中の商品（楽天市場）から、価格の中央値・よくある価格帯・大きさ別の価格を出す
// 「〇〇 盆栽 値段」「〇〇 盆栽 相場」で探す人に、一覧の前提になる数字を答える。数字はビルドした時点の掲載商品から計算する
// 商品が少ないと目安にならないため、8件未満のときは出さない

const MIN_ITEMS = 8

function quantile(sorted: number[], q: number): number {
  const i = (sorted.length - 1) * q
  const lo = Math.floor(i)
  const hi = Math.ceil(i)
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo))
}

// 価格帯の表示は100円単位に丸める（細かい端数は目安として意味がないため）
const round100 = (n: number) => Math.round(n / 100) * 100

export interface PriceStats {
  count: number
  median: number
  low: number
  high: number
  min: number
  max: number
  freeShippingShare: number
  bySize: { label: string; count: number; median: number }[]
  asOf: string | null
}

export function priceStats(products: CatalogProduct[]): PriceStats | null {
  const priced = products.filter(p => p.price > 0)
  if (priced.length < MIN_ITEMS) return null
  const prices = priced.map(p => p.price).sort((a, b) => a - b)
  const bySize = SIZE_OPTIONS.map(option => {
    const list = priced.filter(p => p.sizeCategory === option.value).map(p => p.price).sort((a, b) => a - b)
    return { label: option.label, count: list.length, median: list.length ? quantile(list, 0.5) : 0 }
  }).filter(s => s.count >= 3)
  const synced = priced.map(p => p.lastSyncedAt).filter((d): d is string => Boolean(d)).sort()
  const last = synced[synced.length - 1]
  return {
    count: priced.length,
    median: round100(quantile(prices, 0.5)),
    low: round100(quantile(prices, 0.25)),
    high: round100(quantile(prices, 0.75)),
    min: prices[0],
    max: prices[prices.length - 1],
    freeShippingShare: Math.round((priced.filter(p => p.freeShipping).length / priced.length) * 100),
    bySize,
    asOf: last ? `${new Date(last).getMonth() + 1}月${new Date(last).getDate()}日` : null,
  }
}

export function CategoryPriceGuide({
  products,
  name,
  isTree,
  peak,
  basePath,
  bands,
}: {
  products: CatalogProduct[]
  name: string
  isTree: boolean
  peak?: string | null
  basePath: string
  // 固定のページがある価格帯（/products/category/〇〇/[band]）
  bands: { slug: string; label: string }[]
}) {
  const stats = priceStats(products)
  if (!stats) return null
  const subject = isTree ? `${name}の盆栽` : name
  const asOf = stats.asOf ? `${stats.asOf}時点` : '取得時点'
  const smallest = stats.bySize[0]
  const faq = [
    {
      q: `${subject}の値段の相場は？`,
      a: `掲載中の${stats.count}件では、中央値が${formatPrice(stats.median)}、半分ほどが${formatPrice(stats.low)}〜${formatPrice(stats.high)}の間に入ります（${asOf}・楽天市場）。大きさや樹齢、鉢の種類で価格が大きく変わります。`,
    },
    ...(isTree && smallest
      ? [{
          q: `はじめての${subject}は、どれくらいの大きさがよいですか？`,
          a: `置き場所と水やりの手間を考えると、はじめは小さめのものが扱いやすいです。${smallest.label}の${subject}は、中央値${formatPrice(smallest.median)}ほどで選べます。小さいほど土が乾きやすいので、夏は水切れに気をつけます。`,
        }]
      : []),
    ...(isTree && peak
      ? [{
          q: `${subject}はいつ買うとよいですか？`,
          a: /一年中/.test(peak)
            ? `${subject}は一年中緑を楽しめるので、いつ迎えてもかまいません。植え替えや手入れのしやすさでは、真夏と真冬を避けた春か秋に迎えると、新しい環境になじみやすくなります。`
            : `見頃は${peak}です。見頃の少し前に買うと、届いてから見頃を楽しめます。植え替えや手入れのしやすさでは、春か秋に迎えるのが育てやすい時期です。`,
        }]
      : []),
  ]

  return (
    <section aria-labelledby="price-guide" className="border-t border-ink pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />
      <h2 id="price-guide" className="font-mincho text-[19px] font-bold tracking-[0.05em] text-ink lg:text-[22px]">{subject}の価格の目安</h2>
      <p className="mt-1.5 text-[12px] text-ink-muted">掲載中の{stats.count}件（楽天市場・{asOf}）から計算した目安です</p>

      <dl className="mt-4 grid grid-cols-2 border-l border-t border-line sm:grid-cols-4">
        {[
          { k: '中央値', v: formatPrice(stats.median) },
          { k: 'よくある価格帯', v: `${formatPrice(stats.low)}〜${formatPrice(stats.high)}` },
          { k: '価格の幅', v: `${formatPrice(stats.min)}〜${formatPrice(stats.max)}` },
          { k: '送料込みの商品', v: `約${stats.freeShippingShare}%` },
        ].map(item => (
          <div key={item.k} className="border-b border-r border-line px-3 py-3">
            <dt className="text-[11px] text-ink-muted">{item.k}</dt>
            <dd className="mt-0.5 text-[14px] font-bold text-ink lg:text-[15px]">{item.v}</dd>
          </div>
        ))}
      </dl>

      {stats.bySize.length >= 2 && (
        <div className="mt-5">
          <h3 className="text-[14px] font-bold text-ink">大きさ別の中央値</h3>
          <ul className="mt-2 border-t border-line">
            {stats.bySize.map(s => (
              <li key={s.label} className="flex items-baseline gap-3 border-b border-line py-2.5 text-[13px]">
                <span className="min-w-0 flex-1 text-ink">{s.label}</span>
                <span className="text-[11.5px] text-ink-muted">{s.count}件</span>
                <span className="w-[86px] text-right font-bold text-ink">{formatPrice(s.median)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bands.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {bands.map(band => (
            <Link key={band.slug} href={`${basePath}/${band.slug}`} className="inline-flex min-h-11 items-center border border-line bg-white px-3.5 text-[13px] text-ink hover:border-ink">
              {band.label}の{subject} ›
            </Link>
          ))}
        </div>
      )}

      <h3 className="mt-7 text-[14px] font-bold text-ink">よくある質問</h3>
      <dl className="mt-2 border-t border-line">
        {faq.map(f => (
          <div key={f.q} className="border-b border-line py-3.5">
            <dt className="text-[13.5px] font-bold text-ink">{f.q}</dt>
            <dd className="mt-1 text-[13px] leading-[1.9] text-ink-soft">{f.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] leading-[1.7] text-ink-muted">価格は変わることがあります。最新の価格・送料・在庫は、各ショップの商品ページでご確認ください。</p>
    </section>
  )
}
