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
import { productHeading } from '@/lib/product-heading'
import { CareIcon } from './CareIcon'
import { levelLabel, placeLabel } from '@/lib/product-detail'
import { isEvergreen, peakLabel } from '@/lib/seasons'
import { Placeholder } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { FavoriteButton } from './FavoriteButton'
import { ProductThumb } from './ProductThumb'

// ショップの商品ページへのボタン（墨・四角）。広告リンクのクリックは GA の共通処理で rel="sponsored" から記録する
// ショップ名はボタンの下に小さく添え（ShopCaption）、ボタン自体は「販売ページを見る」にする
export function ShopButton({ product, className = '', size = 'lg' }: { product: CatalogProduct; className?: string; size?: 'lg' | 'md' }) {
  if (!product.buyUrl) return null
  return (
    <a
      href={product.buyUrl}
      target="_blank"
      rel={AFFILIATE_LINK_REL}
      aria-label={`${SHOP_LABELS[product.source]}の販売ページを見る（新しいタブで開きます）`}
      className={`flex items-center justify-center gap-3 bg-sumi tracking-[0.08em] text-white hover:bg-sumi-light hover:text-white ${size === 'lg' ? 'h-[50px] text-sm' : 'h-12 text-sm'} ${className}`}
    >
      販売ページを見る <span aria-hidden="true">↗</span>
    </a>
  )
}

// ボタンの下の小さな注記：PR・販売するショップ
export function ShopCaption({ product, className = '' }: { product: CatalogProduct; className?: string }) {
  if (!product.buyUrl) return null
  const shop = product.shopName && product.shopName !== SHOP_LABELS[product.source] ? `${SHOP_LABELS[product.source]}・${product.shopName}` : SHOP_LABELS[product.source]
  return (
    <p className={`flex min-w-0 items-center gap-1.5 text-[11px] leading-[1.6] text-ink-muted ${className}`}>
      <PrMark />
      <span className="truncate">{shop}</span>
    </p>
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

// 広告リンクであることの小さな表示（ショップボタンの近くに出す）
export function PrMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex h-4 shrink-0 items-center border border-ink-muted/50 px-1 text-[10px] leading-none tracking-[0.04em] text-ink-muted ${className}`}>PR</span>
  )
}

// 商品の情報（見出し・3つの数字・ショップボタン・表）。一覧の右パネルと商品ページで共通
export function ProductInfo({
  product,
  headingLevel = 'h2',
  showOriginalName = false,
  showDescription = false,
  pageMode = false,
}: {
  product: PanelProduct
  headingLevel?: 'h1' | 'h2'
  showOriginalName?: boolean
  showDescription?: boolean
  // 商品ページ：育てやすさ・置き場所・見頃は下の「◯◯について」にまとめるので、ここでは出さない
  pageMode?: boolean
}) {
  const Title = headingLevel
  const stats = productStats(product).filter(stat => !pageMode || stat.label !== '見頃')
  const rows = productRows(product).filter(row => !pageMode || (row.label !== '置き場所' && row.label !== '育てやすさ'))
  const species = categoryLink(product)?.label ?? product.speciesLabel
  const hasTraits = Boolean(product.place || product.level || product.speciesKey)
  // 商品ページの見出しは「品種・樹種の盆栽｜特徴」に整えた名前（src/lib/product-heading.ts）
  const title = pageMode ? productHeading(product, product.displayName || product.name) : product.displayName || product.name
  const shopTitle = product.originalDisplayName || product.originalName
  const price = stats.find(stat => stat.label === '価格')
  const sizeStat = stats.find(stat => stat.label === '届くサイズ')
  const peak = isEvergreen(product) ? '一年中（常緑）' : peakLabel(product)
  const traits = [
    { label: '育てやすさ', value: levelLabel(product), icon: 'level' },
    { label: '置き場所', value: placeLabel(product), icon: product.place === 'indoor' ? 'indoor' : 'outdoor' },
    { label: '見頃', value: peak ? `見頃 ${peak}` : null, icon: 'season' },
  ].filter((t): t is { label: string; value: string; icon: string } => Boolean(t.value))

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3 text-xs text-ink-muted">
        {species && <span className={pageMode ? 'tracking-[0.12em] text-gold-dark' : ''}>{species}</span>}
        {!pageMode && <span>{SHOP_LABELS[product.source]}</span>}
        <FavoriteButton productId={product.id} productName={title} variant="text" className="ml-auto" />
      </div>
      <Title
        title={title}
        className={`mt-1 font-mincho font-bold leading-[1.5] text-ink ${
          headingLevel === 'h1' ? 'line-clamp-2 text-[19px] tracking-[0.04em] lg:text-[23px] lg:tracking-[0.05em]' : 'text-[19px] tracking-[0.04em] lg:text-xl'
        }`}
      >
        {title}
      </Title>
      {showOriginalName && shopTitle && shopTitle !== title && (
        // ショップでの商品名は長いため、1行だけ見せて押すと全文を開く
        <details className="group mt-1.5 text-[11.5px] leading-[1.7] text-ink-muted">
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1 truncate group-open:hidden">ショップでの商品名：{shopTitle}</span>
            <span className="hidden flex-1 group-open:inline">ショップでの商品名</span>
            <span aria-hidden="true" className="shrink-0 text-ink-soft group-open:rotate-180">⌄</span>
          </summary>
          <p className="break-words">{shopTitle}</p>
        </details>
      )}

      {/* 商品ページ：大事な3つ（育てやすさ・置き場所・見頃）をアイコン付きの札で */}
      {pageMode && traits.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5 lg:mt-4">
          {traits.map(trait => (
            <li key={trait.label} className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1.5 text-[12.5px] text-ink">
              <CareIcon name={trait.icon} className="h-4 w-4 text-gold-dark" />
              <span className="sr-only">{trait.label}：</span>
              {trait.value}
            </li>
          ))}
        </ul>
      )}

      {pageMode && price ? (
        // 価格を大きく太く、送料・レビュー・サイズは小さく
        <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2 border-y border-line py-3.5 lg:mt-6 lg:py-4">
          <div>
            <div className="text-[28px] font-bold leading-none tracking-[0.01em] text-ink lg:text-[32px]">{price.value}</div>
            <div className="mt-1.5 flex flex-wrap gap-x-2.5 text-[11.5px] text-ink-muted">
              {price.note && <span>{price.note}</span>}
              {price.rating && <span>{price.rating}</span>}
            </div>
          </div>
          {sizeStat && (
            <div className="ml-auto flex items-center gap-1.5 text-right">
              <CareIcon name="size" className="h-4 w-4 text-ink-muted" />
              <div>
                <div className="text-[11px] text-ink-muted">{sizeStat.label}</div>
                <div className="text-[15px] font-bold text-ink lg:text-base">{sizeStat.value}{sizeStat.note && <span className="ml-1 text-[11.5px] font-normal text-ink-muted">{sizeStat.note}</span>}</div>
              </div>
            </div>
          )}
        </div>
      ) : stats.length > 0 && (
        <dl className={`mt-3 grid border-y border-line lg:mt-[22px] ${STAT_COLS[stats.length]}`}>
          {stats.map((stat, i) => (
            <div key={stat.label} className={`min-w-0 py-2.5 pl-2.5 pr-1 lg:py-3.5 lg:pl-4 ${i > 0 ? 'border-l border-line' : ''}`}>
              <dt className="text-[11px] text-ink-muted">{stat.label}</dt>
              <dd className="mt-0.5 text-[15px] leading-snug text-ink lg:text-xl">{stat.value}</dd>
              {stat.note && <dd className={`text-[11px] ${stat.accent ? 'text-gold-dark' : 'text-ink-muted'}`}>{stat.note}</dd>}
              {stat.rating && <dd className="text-[11px] text-ink-muted">{stat.rating}</dd>}
            </div>
          ))}
        </dl>
      )}

      {/* スマホは画面下のバーにボタンを出す */}
      <div className="hidden lg:block">
        <ShopButton product={product} className="mt-5" />
        <ShopCaption product={product} className="mt-2" />
        <p className="mt-1 text-[11px] leading-[1.7] text-ink-muted">{priceNote(product)}</p>
      </div>
      <p className="mt-2 text-[11px] leading-[1.7] text-ink-muted lg:hidden">{priceNote(product)}</p>
      {product.soldOut && <p className="mt-2 text-[13px] text-ink">現在、販売されていない可能性があります。</p>}

      <dl className="mt-[18px] border-t border-line lg:mt-7">
        {rows.map(row => (
          <div key={row.label} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3.5 border-b border-paper-deep py-3 text-[12.5px] leading-[1.7] lg:grid-cols-[88px_minmax(0,1fr)] lg:text-[13px]">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="min-w-0 break-words text-ink">
              {row.value}
              {row.claim && <span className="block text-[11.5px] text-gold-dark">{row.claim}</span>}
              {row.note && <span className="block text-[11.5px] text-ink-muted">{row.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {hasTraits && !pageMode && <p className="mt-2 text-[11px] text-ink-muted">置き場所・育てやすさ・見頃は、樹種ごとの一般的な目安です。</p>}

      {showDescription && product.description && (
        <details className="group mt-4 border-b border-line pb-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center text-[13px] text-ink [&::-webkit-details-marker]:hidden">
            <span className="border-b border-ink pb-0.5">販売店の商品説明（抜粋）</span>
          </summary>
          {pageMode && shopTitle && shopTitle !== title && <p className="mt-3 break-words text-[12px] leading-[1.8] text-ink-muted">ショップでの商品名：{shopTitle}</p>}
          <p className="mt-3 whitespace-pre-line text-[13px] leading-[1.9] text-ink-soft">{product.description}</p>
        </details>
      )}

      <PrDisclosure compact className="mt-4" />
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

// スマホで画面下に固定する価格とショップボタン（商品ページでは下のタブを出さないため、画面の一番下に置く）
// ページの最後（フッターのリンク）が隠れないよう、スマホでは body の下にバーの高さ分の余白をつける
export const BUY_BAR_HEIGHT = 72
export function ProductBuyBar({ product }: { product: CatalogProduct }) {
  if (!product.buyUrl) return null
  return (
    <>
      <style>{`@media (max-width: 1023.98px){body{padding-bottom:calc(${BUY_BAR_HEIGHT}px + env(safe-area-inset-bottom))}}`}</style>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-center gap-3.5 px-4 py-3" style={{ height: BUY_BAR_HEIGHT - 1 }}>
          <div className="shrink-0">
            <div className="text-[19px] leading-tight text-ink">{formatPrice(product.price)}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-ink-muted">
              <PrMark />
              <span>{[SHOP_LABELS[product.source], shortPriceNote(product)].filter(Boolean).join('・')}</span>
            </div>
          </div>
          <ShopButton product={product} size="md" className="flex-1" />
        </div>
      </div>
    </>
  )
}
