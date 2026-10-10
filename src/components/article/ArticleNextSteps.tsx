import Link from 'next/link'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import type { CatalogProduct } from '@/lib/catalog-model'
import { ArticleCardGrid, type ArticleCardItem } from '@/components/article/RelatedArticleRows'

export interface NextStepLink {
  href: string
  title: string
  note?: string
}

interface ArticleNextStepsProps {
  // 商品（樹種の記事ならその樹種、そうでなければ記事に関連する商品）
  products: CatalogProduct[]
  productsHeading?: string
  // 「すべて見る」の行き先（樹種の商品一覧）
  productsMore?: { href: string; label: string }
  // 同じ樹種の育て方の記事（画像つきのカード）
  guides: ArticleCardItem[]
  guidesHeading?: string
  // 特集・診断などの案内
  links: NextStepLink[]
  // 記事の内容に合う「選ぶ・育てる」の道具
  tools?: NextStepLink[]
  hasRakuten: boolean
}

function LinkRows({ items }: { items: NextStepLink[] }) {
  return (
    <ul className="border-t border-line">
      {items.map(item => (
        <li key={item.href} className="border-b border-line">
          <Link href={item.href} className="group flex min-h-[56px] items-center gap-3 py-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium leading-[1.6] text-ink group-hover:text-gold-dark">{item.title}</span>
              {item.note && <span className="mt-0.5 block text-[12.5px] leading-[1.7] text-ink-muted">{item.note}</span>}
            </span>
            <span aria-hidden="true" className="text-ink-muted group-hover:text-ink">›</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

// 記事を読み終えたあとの案内（商品・同じ樹種の記事・特集・診断）。1か所にまとめて出す
export function ArticleNextSteps({ products, productsHeading, productsMore, guides, guidesHeading, links, tools = [], hasRakuten }: ArticleNextStepsProps) {
  return (
    <section aria-labelledby="next-steps" className="mt-16 border-t border-ink pt-8 lg:mt-20 lg:pt-10">
      <h2 id="next-steps" className="font-mincho text-[21px] font-bold tracking-[0.06em] text-ink lg:text-2xl">次にやること</h2>

      {products.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[15px] font-bold text-ink">{productsHeading ?? 'この記事に関連する商品'}</h3>
            <p className="text-[11.5px] text-ink-muted">
              <span className="mr-1.5 text-ink-soft">PR</span>価格は取得時点の情報です
            </p>
          </div>
          {/* SP は横にスクロール、PC は3列 */}
          <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
            {products.map(product => (
              <div key={product.id} className="w-[44%] flex-none snap-start lg:w-auto">
                <CatalogProductCard product={product} sizes="(max-width: 1023px) 44vw, 200px" />
              </div>
            ))}
          </div>
          {productsMore && (
            <Link href={productsMore.href} className="mt-4 inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">
              {productsMore.label} ›
            </Link>
          )}
          {hasRakuten && (
            <p className="mt-2 text-[11px] text-ink-muted">
              楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>
            </p>
          )}
        </div>
      )}

      {guides.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-[15px] font-bold text-ink">{guidesHeading ?? 'あわせて読みたい育て方'}</h3>
          <ArticleCardGrid items={guides} />
        </div>
      )}

      {tools.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-2 text-[15px] font-bold text-ink">この記事とあわせて使う</h3>
          <LinkRows items={tools} />
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-2 text-[15px] font-bold text-ink">盆栽を選ぶ</h3>
          <LinkRows items={links} />
        </div>
      )}
    </section>
  )
}
