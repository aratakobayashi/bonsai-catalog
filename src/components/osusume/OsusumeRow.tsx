import Link from 'next/link'
import type { OsusumeItem } from '@/lib/osusume'
import { AFFILIATE_LINK_REL, BUY_LABEL } from '@/lib/affiliate'
import { formatPrice } from '@/lib/utils'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { FavoriteButton } from '@/components/catalog/FavoriteButton'

const SOURCE_LABELS: Record<string, string> = { rakuten: '楽天市場', amazon: 'Amazon' }

// おすすめの1行（順位・写真・名前・価格・選んだ理由・ショップへのボタン）
// 上位3つは順位の数字を金色にする。カードのクリックは product_card_click（data-card）、ボタンは affiliate_click（data-place）で記録する
export function OsusumeRow({ item, rank, place, priority = false }: { item: OsusumeItem; rank: number; place: string; priority?: boolean }) {
  const { product, reasons } = item
  const title = product.displayName || product.name
  return (
    <li className="border-b border-line py-5 lg:py-6" data-card={product.id}>
      <div className="grid grid-cols-[28px_104px_minmax(0,1fr)] gap-x-3 lg:grid-cols-[52px_168px_minmax(0,1fr)_220px] lg:gap-x-6">
        {/* 順位 */}
        <div className="pt-0.5 text-center">
          <span className={`block font-mincho text-[22px] font-bold leading-none lg:text-[34px] ${rank <= 3 ? 'text-gold-dark' : 'text-ink-muted'}`}>{rank}</span>
          <span className="mt-1 block text-[10px] text-ink-muted">位</span>
        </div>
        {/* 写真 */}
        <Link href={`/products/${product.id}`} prefetch={false} className="relative block aspect-[4/5] overflow-hidden bg-paper-deep" tabIndex={-1} aria-hidden="true">
          <ProductThumb src={product.imageUrl} alt="" sizes="(max-width: 1023px) 104px, 168px" size={336} priority={priority} />
        </Link>
        {/* 名前・価格・理由 */}
        <div className="min-w-0">
          <Link href={`/products/${product.id}`} prefetch={false} className="group block">
            {product.speciesLabel && <span className="block text-[11px] text-gold-dark">{product.speciesLabel}</span>}
            <span className="mt-0.5 line-clamp-2 block text-[14.5px] font-bold leading-[1.5] text-ink group-hover:text-gold-dark lg:line-clamp-3 lg:font-mincho lg:text-[17px]">{title}</span>
          </Link>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[13px] text-ink">
            <span className="text-[15px] font-bold lg:text-[17px]">{formatPrice(product.price)}</span>
            {product.freeShipping && <span className="text-[11.5px] text-ink-muted">送料込</span>}
            {product.reviewCount > 0 && <span className="text-[12px] text-ink-muted">★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）</span>}
          </p>
          {reasons.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="選んだ理由">
              {reasons.map(r => (
                <li key={r} className="border border-gold/40 bg-gold-light px-2 py-0.5 text-[11px] leading-[1.6] text-gold-dark">{r}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-ink-muted">{SOURCE_LABELS[product.source] ?? ''}{product.shopName ? `・${product.shopName}` : ''}</p>
        </div>
        {/* ボタン（SP は下に横幅いっぱい） */}
        <div className="col-span-3 mt-3 flex items-center gap-2 lg:col-span-1 lg:mt-0 lg:flex-col lg:items-stretch lg:justify-start lg:pt-1">
          {product.buyUrl && (
            <a
              href={product.buyUrl}
              target="_blank"
              rel={AFFILIATE_LINK_REL}
              data-place={place}
              data-product={product.id}
              aria-label={`${title}の在庫と価格を${SOURCE_LABELS[product.source] ?? 'ショップ'}で見る（新しいタブで開きます）`}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 bg-sumi lg:flex-none text-[13px] tracking-[0.04em] text-white hover:bg-sumi-light hover:text-white"
            >
              {BUY_LABEL} <span aria-hidden="true">↗</span>
            </a>
          )}
          <Link href={`/products/${product.id}`} prefetch={false} className="flex h-11 flex-none items-center justify-center border border-line bg-white px-4 text-[13px] text-ink hover:border-ink">
            詳しく見る
          </Link>
          <FavoriteButton productId={product.id} productName={title} variant="icon" className="lg:hidden" />
        </div>
      </div>
    </li>
  )
}
