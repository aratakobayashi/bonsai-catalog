import Link from 'next/link'
import { CONTAINER } from '@/components/ui/design'
import { getShopCategory } from '@/lib/shop-categories'

const DESTINATIONS = [
  { href: '/products', title: '探す', body: '盆栽・鉢・道具を比べる' },
  { href: '/guides', title: '育て方', body: '記事とよくある質問' },
  { href: '/gardens', title: '出かける', body: '盆栽園・イベント' },
  { href: '/', title: 'ホーム', body: 'トップページへ' },
]

// よく見られる樹種のカテゴリ（存在するものだけ出す）
const POPULAR_SPECIES = ['goyomatsu', 'kuromatsu', 'shimpaku', 'momiji', 'sakura', 'ume', 'mini']
  .map(slug => getShopCategory(slug))
  .filter((c): c is NonNullable<typeof c> => Boolean(c))

export default function NotFound() {
  return (
    <div className={`${CONTAINER} pb-14 lg:pb-20`}>
      <div className="mx-auto max-w-[624px] pt-[72px] text-center lg:pt-24">
        <p className="font-mono text-xs tracking-[0.3em] text-gold-dark lg:text-[13px]">404</p>
        <h1 className="mt-2.5 font-mincho text-[22px] font-bold leading-[1.45] tracking-[0.08em] text-ink lg:mt-3.5 lg:text-[32px]">
          お探しのページが<br className="lg:hidden" />見つかりませんでした
        </h1>
        <p className="mt-2.5 text-[13px] leading-[2] text-ink-soft lg:mt-3.5 lg:text-[14.5px]">
          ページが移動したか、削除された可能性があります。
        </p>

        {/* 商品一覧の検索に送る（JavaScript なしでも動くフォーム） */}
        <form action="/products" method="get" role="search" className="mx-auto mt-6 flex max-w-[440px] items-center border-b border-sumi lg:mt-9">
          <input
            type="search"
            name="q"
            required
            placeholder="樹種・商品名・記事を検索"
            aria-label="サイト内を検索"
            className="h-[46px] min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-muted outline-none lg:h-[50px]"
          />
          <button type="submit" className="shrink-0 px-1 text-[13px] tracking-[0.06em] text-ink hover:text-gold-dark">
            検索
          </button>
        </form>
      </div>

      <nav aria-label="おもなページ" className="mx-auto mt-8 max-w-[624px] lg:mt-14">
        <ul className="lg:grid lg:grid-cols-4 lg:gap-6">
          {DESTINATIONS.map(d => (
            <li key={d.href}>
              <Link href={d.href} className="flex items-baseline border-b border-line py-3.5 hover:text-gold-dark lg:block lg:border-b-0 lg:border-t lg:border-sumi lg:pb-0 lg:pt-3">
                <span className="w-[90px] shrink-0 font-mincho text-base font-bold tracking-[0.04em] lg:block lg:w-auto">{d.title}</span>
                <span className="text-xs text-ink-muted lg:mt-1 lg:block">{d.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {POPULAR_SPECIES.length > 0 && (
        <div className="mx-auto mt-10 max-w-[624px] lg:mt-14">
          <p className="text-xs text-ink-muted">よく見られる樹種</p>
          <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px]">
            {POPULAR_SPECIES.map(c => (
              <li key={c.slug}>
                <Link href={`/products/category/${c.slug}`} className="border-b border-ink pb-0.5 text-ink hover:border-gold-dark hover:text-gold-dark">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
