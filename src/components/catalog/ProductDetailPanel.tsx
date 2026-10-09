import { AFFILIATE_LINK_REL } from '@/lib/affiliate'
import { formatPrice } from '@/lib/utils'
import {
  SHOP_LABELS,
  categoryLink,
  currentMonthJst,
  priceNote,
  productRows,
  productStats,
  seasonMonths,
  shortPriceNote,
} from '@/lib/product-detail'
import type { CatalogProduct } from '@/lib/catalog-model'
import { Placeholder } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { FavoriteButton } from './FavoriteButton'
import { ProductThumb } from './ProductThumb'

// ショップの商品ページへのボタン（墨・四角）。広告リンクのクリックは GA の共通処理で rel="sponsored" から記録する
export function ShopButton({ product, className = '', size = 'lg' }: { product: CatalogProduct; className?: string; size?: 'lg' | 'md' }) {
  if (!product.buyUrl) return null
  return (
    <a
      href={product.buyUrl}
      target="_blank"
      rel={AFFILIATE_LINK_REL}
      className={`flex items-center justify-center gap-3 bg-sumi tracking-[0.08em] text-white hover:bg-sumi-light hover:text-white ${size === 'lg' ? 'h-[50px] text-sm' : 'h-12 text-sm'} ${className}`}
    >
      {SHOP_LABELS[product.source]}で見る <span aria-hidden="true">↗</span>
    </a>
  )
}

interface PanelProduct extends CatalogProduct {
  description?: string
  soldOut?: boolean
}

// 商品画像（画像がないときは斜線の下地）
// priority=false は、スマホでは表示しない一覧の詳細パネル用（非表示の画像を先に読み込まない）
export function ProductImage({ product, sizes, className = 'aspect-square', size = 600, priority = true }: { product: CatalogProduct; sizes: string; className?: string; size?: number; priority?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {product.imageUrl ? (
        <ProductThumb src={product.imageUrl} alt={product.name} sizes={sizes} priority={priority} size={size} className="object-contain" />
      ) : (
        <Placeholder label="画像なし" className="absolute inset-0" />
      )}
    </div>
  )
}

const STAT_COLS = ['grid-cols-1', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3']

// 商品の情報（見出し・3つの数字・ショップボタン・表）。一覧の右パネルと商品ページで共通
export function ProductInfo({
  product,
  headingLevel = 'h2',
  showOriginalName = false,
  showDescription = false,
}: {
  product: PanelProduct
  headingLevel?: 'h1' | 'h2'
  showOriginalName?: boolean
  showDescription?: boolean
}) {
  const Title = headingLevel
  const stats = productStats(product)
  const rows = productRows(product)
  const species = categoryLink(product)?.label ?? product.speciesLabel
  const hasTraits = Boolean(product.place || product.level || product.seasons.length)

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3 text-xs text-ink-muted">
        {species && <span>{species}</span>}
        <span>{SHOP_LABELS[product.source]}</span>
        <FavoriteButton productId={product.id} productName={product.name} variant="text" className="ml-auto" />
      </div>
      <Title
        className={`mt-2 font-mincho font-bold leading-[1.5] text-ink ${
          headingLevel === 'h1' ? 'text-[21px] tracking-[0.06em] lg:text-[26px]' : 'text-[19px] tracking-[0.04em] lg:text-xl'
        }`}
      >
        {product.name}
      </Title>
      {showOriginalName && product.originalName !== product.name && (
        <p className="mt-2 text-[11.5px] leading-[1.7] text-ink-muted">ショップでの商品名：{product.originalName}</p>
      )}

      {stats.length > 0 && (
        <dl className={`mt-4 grid border-y border-line lg:mt-[22px] ${STAT_COLS[stats.length]}`}>
          {stats.map((stat, i) => (
            <div key={stat.label} className={`py-2.5 pl-2.5 lg:py-3.5 lg:pl-4 ${i > 0 ? 'border-l border-line' : ''}`}>
              <dt className="text-[10px] text-ink-muted lg:text-[11px]">{stat.label}</dt>
              <dd className="mt-0.5 text-[15px] text-ink lg:text-xl">{stat.value}</dd>
              {stat.note && <dd className={`text-[10px] lg:text-[11px] ${stat.accent ? 'text-gold-dark' : 'text-ink-muted'}`}>{stat.note}</dd>}
            </div>
          ))}
        </dl>
      )}

      {/* スマホは画面下のバーにボタンを出す */}
      <div className="hidden lg:block">
        <ShopButton product={product} className="mt-5" />
        <p className="mt-2 text-[11px] leading-[1.7] text-ink-muted">{priceNote(product)}</p>
      </div>
      <p className="mt-2 text-[11px] leading-[1.7] text-ink-muted lg:hidden">{priceNote(product)}</p>
      {product.soldOut && <p className="mt-2 text-[13px] text-ink">現在、販売されていない可能性があります。</p>}

      <dl className="mt-[18px] border-t border-line lg:mt-7">
        {rows.map(row => (
          <div key={row.label} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3.5 border-b border-paper-deep py-3 text-[12.5px] leading-[1.7] lg:grid-cols-[88px_minmax(0,1fr)] lg:text-[13px]">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="min-w-0 break-words text-ink">
              {row.value}
              {row.note && <span className="block text-[11.5px] text-ink-muted">{row.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {hasTraits && <p className="mt-2 text-[11px] text-ink-muted">置き場所・育てやすさ・見頃は、樹種ごとの一般的な目安です。</p>}

      {showDescription && product.description && (
        <details className="group mt-4 border-b border-line pb-3">
          <summary className="cursor-pointer list-none text-[13px] text-ink [&::-webkit-details-marker]:hidden">
            <span className="border-b border-ink pb-0.5">販売店の商品説明（抜粋）</span>
          </summary>
          <p className="mt-3 whitespace-pre-line text-[13px] leading-[1.9] text-ink-soft">{product.description}</p>
        </details>
      )}

      <PrDisclosure className="mt-4" />
      {product.source === 'rakuten' && (
        <p className="mt-1 text-[11px] text-ink-muted">
          楽天市場の商品情報は{' '}
          <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
        </p>
      )}
    </div>
  )
}

// 12か月の見頃のバー（樹種の季節から。今月は少し高くする）
export function SeasonBar({ product, className = '' }: { product: CatalogProduct; className?: string }) {
  const months = seasonMonths(product)
  if (!months.length) return null
  const now = currentMonthJst()
  return (
    <div className={`max-w-[420px] ${className}`}>
      <div className="grid h-2.5 grid-cols-12 items-end gap-[3px]" role="img" aria-label={`見頃の目安：${[...months].sort((a, b) => a - b).join('・')}月`}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
          <div key={m} className={`${m === now ? 'h-2.5' : 'h-1'} ${months.includes(m) ? 'bg-gold' : 'bg-line'}`} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink-muted" aria-hidden="true">
        <span>1月</span>
        <span>6月</span>
        <span>12月</span>
      </div>
    </div>
  )
}

// 商品の詳細（PCの一覧の右側のパネル）。商品ページは ProductImage と ProductInfo を並べて使う
export function ProductDetailPanel({ product, headingLevel = 'h2', showDescription = false }: { product: PanelProduct; headingLevel?: 'h1' | 'h2'; showDescription?: boolean }) {
  return (
    <div>
      <ProductImage product={product} sizes="(max-width: 1024px) 100vw, 40vw" className="aspect-[4/3]" />
      <div className="mt-6">
        <ProductInfo product={product} headingLevel={headingLevel} showDescription={showDescription} />
      </div>
    </div>
  )
}

// スマホで画面下（下のタブの上）に固定する価格とショップボタン
export function ProductBuyBar({ product }: { product: CatalogProduct }) {
  if (!product.buyUrl) return null
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] z-30 flex items-center gap-3.5 border-t border-line bg-paper px-4 py-3 lg:hidden">
      <div className="shrink-0">
        <div className="text-[19px] leading-tight text-ink">{formatPrice(product.price)}</div>
        <div className="text-[10px] text-ink-muted">{shortPriceNote(product)}</div>
      </div>
      <ShopButton product={product} size="md" className="flex-1" />
    </div>
  )
}
