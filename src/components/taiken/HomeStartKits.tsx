import Link from 'next/link'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { byCuratedThenReviews } from '@/components/home/curated'
import type { CatalogProduct } from '@/lib/catalog-model'

// 体験・教室のページ（/taiken）の「家で始める」：近くに教室がない人・まず家で試したい人に、
// 楽天市場の苔玉キット・盆栽の栽培キット・道具付きのミニ盆栽セットを見せる（商品名の表記で分ける）

const lowRated = (p: CatalogProduct) => p.reviewCount > 0 && p.reviewAverage > 0 && p.reviewAverage < 3.5
const usable = (p: CatalogProduct) => Boolean(p.imageUrl && p.buyUrl) && !lowRated(p)

export const KIT_GROUPS = [
  {
    key: 'kokedama',
    title: '苔玉キット',
    note: '土を丸めて苔を巻くだけ。いちばん手軽で、親子でも作れます',
    test: (p: CatalogProduct) => p.productType === 'kit' && /苔玉/.test(p.originalName),
    more: { href: '/products?type=kokedama', label: '苔玉・キットをすべて見る' },
  },
  {
    key: 'grow',
    title: '盆栽の栽培キット',
    note: '種や小さな苗から育てる。芽が出て樹になるまでを楽しめます',
    test: (p: CatalogProduct) => p.productType === 'kit' && !/苔玉/.test(p.originalName),
    more: { href: '/guides/bonsai-kit-guide', label: '栽培キットの選び方' },
  },
  {
    key: 'set',
    title: '道具付きのミニ盆栽セット',
    note: '仕立てた樹と、はさみなどの道具が一緒に届く。届いた日から手入れを始められます',
    test: (p: CatalogProduct) => p.productType === 'tree' && /道具/.test(p.originalName) && /セット/.test(p.originalName),
    more: { href: '/soroeru', label: '鉢・土・道具をそろえる' },
  },
] as const

export function pickKits(all: CatalogProduct[], limit = 4) {
  return KIT_GROUPS.map(g => ({ ...g, products: all.filter(p => usable(p) && g.test(p)).sort(byCuratedThenReviews).slice(0, limit) })).filter(g => g.products.length >= 2)
}

export function HomeStartKits({ groups }: { groups: ReturnType<typeof pickKits> }) {
  if (groups.length === 0) return null
  return (
    <section id="ie-de" aria-labelledby="home-start" className="mt-14 scroll-mt-20 bg-paper-deep px-4 py-8 lg:mt-20 lg:px-8 lg:py-10">
      <p className="text-[11.5px] tracking-[0.14em] text-gold-dark">近くに教室がないときは</p>
      <h2 id="home-start" className="mt-1.5 font-mincho text-[22px] font-bold tracking-[0.04em] text-ink lg:text-[26px]">家で始める盆栽キット</h2>
      <p className="mt-2 max-w-[720px] text-[14px] leading-[1.85] text-ink-soft">体験教室に行けなくても、キットなら家で同じように作れます。楽天市場の商品から、レビューの評価の低いものを除いて選びました。</p>
      {groups.map(g => (
        <div key={g.key} className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2">
            <h3 className="font-mincho text-[18px] font-bold text-ink">{g.title}<span className="ml-2 text-[12.5px] font-normal text-ink-muted">{g.note}</span></h3>
            <Link href={g.more.href} className="text-[13px] text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">{g.more.label} ›</Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 lg:grid-cols-4 lg:gap-5">
            {g.products.map(p => (
              <li key={p.id} className="min-w-0">
                <CatalogProductCard product={p} buyPlace={`taiken_kit_${g.key}`} sizes="(max-width: 1023px) 46vw, 240px" />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-6 text-[12px] text-ink-muted">PR：楽天市場の商品へのリンクを含みます。価格は取得時点のものです。</p>
    </section>
  )
}
