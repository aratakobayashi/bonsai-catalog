import Link from 'next/link'
import { AFFILIATE_LINK_REL } from '@/lib/affiliate'
import { formatPrice } from '@/lib/utils'
import { getCareGuide, getPurchaseChecklist } from '@/lib/care-guides'
import { PRODUCT_TYPE_LABELS } from '@/lib/product-classify'
import { SHOP_LABELS, categoryLink, isPartProduct, priceNote, productSpecs } from '@/lib/product-detail'
import type { CatalogProduct } from '@/lib/catalog-model'
import { Breadcrumbs } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { ProductThumb } from './ProductThumb'
import { SourceBadge } from './CatalogProductCard'

export function ShopButton({ product, className = '', size = 'lg' }: { product: CatalogProduct; className?: string; size?: 'lg' | 'md' }) {
  if (!product.buyUrl) return null
  return (
    <a
      href={product.buyUrl}
      target="_blank"
      rel={AFFILIATE_LINK_REL}
      className={`flex items-center justify-center gap-1 rounded-xl font-bold text-white ${size === 'lg' ? 'h-[52px] text-base' : 'h-11 text-[15px]'} ${
        product.source === 'rakuten' ? 'bg-rakuten hover:bg-[#a30000]' : 'bg-amazon hover:bg-[#a84a0a]'
      } ${className}`}
    >
      {SHOP_LABELS[product.source]}で見る <span aria-hidden="true">↗</span>
    </a>
  )
}

interface PanelProduct extends CatalogProduct {
  description?: string
  soldOut?: boolean
}

// 商品の詳細（PCの一覧では右側のパネル、商品ページでは本文として表示）
export function ProductDetailPanel({ product, headingLevel = 'h2', showDescription = false }: { product: PanelProduct; headingLevel?: 'h1' | 'h2'; showDescription?: boolean }) {
  const isPart = isPartProduct(product)
  const catLink = categoryLink(product)
  const specs = productSpecs(product)
  const checklist = getPurchaseChecklist(product.productType)
  const careGuide = getCareGuide(product.productType, product.category)
  const Title = headingLevel
  const crumbs = [
    { label: '探す', href: '/products' },
    ...(catLink ? [{ label: catLink.label, href: catLink.href }] : !isPart && product.category !== 'その他' ? [{ label: product.category }] : []),
    { label: PRODUCT_TYPE_LABELS[product.productType] },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={crumbs} className="hidden lg:block" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
        <div className="relative -mx-4 aspect-square overflow-hidden bg-white lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
          <ProductThumb src={product.imageUrl} alt={product.name} sizes="(max-width: 1024px) 100vw, 40vw" priority className="object-contain" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <SourceBadge source={product.source} />
            <span className="rounded bg-[#f1eee8] px-1.5 py-0.5 text-[11px] text-ink-soft">{PRODUCT_TYPE_LABELS[product.productType]}</span>
            {!isPart && product.category !== 'その他' && (
              <span className="rounded bg-[#f1eee8] px-1.5 py-0.5 text-[11px] text-ink-soft">{product.category}</span>
            )}
            {product.freeShipping && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[11px] text-green-700">送料無料</span>}
          </div>
          <Title className="mt-2 text-xl font-bold leading-snug text-ink lg:text-[22px]">{product.name}</Title>
          <p className="mt-2 text-[13px] text-ink-soft">
            販売：{product.shopName}
            {product.reviewCount > 0 && (
              <span className="ml-3 lg:hidden">★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）</span>
            )}
          </p>

          <div className="mt-4 hidden rounded-2xl border border-line bg-white p-5 lg:block">
            <div className="flex items-baseline gap-3">
              <span className="text-[32px] font-bold text-navy">{formatPrice(product.price)}</span>
              {product.reviewCount > 0 && (
                <span className="text-sm text-ink-muted">★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）</span>
              )}
            </div>
            <ShopButton product={product} className="mt-4" />
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">{priceNote(product)}</p>
            {product.soldOut && <p className="mt-2 text-sm text-amber-700">現在、販売されていない可能性があります。</p>}
          </div>
          <PrDisclosure className="mt-4" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 lg:p-6">
          <h3 className="font-bold text-navy">商品の情報</h3>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {specs.map(spec => (
                <tr key={spec.label} className="border-b border-line last:border-b-0">
                  <th className="w-28 py-2.5 pr-3 text-left align-top font-normal text-ink-muted">{spec.label}</th>
                  <td className="py-2.5 text-ink">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {showDescription && product.description && (
            <div className="mt-5">
              <h4 className="text-sm font-bold text-ink">販売店の商品説明（抜粋）</h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{product.description}</p>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-line bg-white p-5 lg:p-6">
            <h3 className="font-bold text-navy">購入前にチェックしたいこと</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {checklist.map(item => (
                <li key={item} className="flex gap-2"><span className="text-gold">✓</span><span>{item}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">いずれも販売ページの説明やショップへの問い合わせで確認できます。</p>
          </section>

          {careGuide && (
            <section className="rounded-2xl border border-[#eadfca] bg-[#fbf8f2] p-5 lg:p-6">
              <h3 className="font-mincho text-lg font-bold text-navy">{careGuide.title}</h3>
              <dl className="mt-3 space-y-2.5 text-sm leading-relaxed">
                {careGuide.items.map(item => (
                  <div key={item.label}>
                    <dt className="inline font-bold text-ink">{item.label}</dt>
                    <dd className="ml-3 inline text-ink-soft">{item.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-ink-muted">一般的な目安です。品種や地域によって異なるため、商品ごとの説明もあわせてご確認ください。</p>
              {careGuide.guideLink && (
                <Link href={careGuide.guideLink.href} className="mt-2 inline-block text-sm font-bold text-navy underline">
                  {careGuide.guideLink.label} →
                </Link>
              )}
            </section>
          )}
        </div>
      </div>

      {product.source === 'rakuten' && (
        <p className="text-xs text-ink-muted">
          楽天市場の商品情報は{' '}
          <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
        </p>
      )}
    </div>
  )
}

// スマホで画面下に固定する価格とショップボタン
export function ProductBuyBar({ product }: { product: CatalogProduct }) {
  if (!product.buyUrl) return null
  const date = product.lastSyncedAt ? new Date(product.lastSyncedAt) : null
  return (
    <div className="fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-line bg-white px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden">
      <div className="shrink-0">
        <div className="text-xl font-bold text-navy">{formatPrice(product.price)}</div>
        <div className="text-[10px] text-ink-muted">{date ? `${date.getMonth() + 1}/${date.getDate()}時点の` : ''}参考価格</div>
      </div>
      <ShopButton product={product} size="md" className="flex-1" />
    </div>
  )
}
