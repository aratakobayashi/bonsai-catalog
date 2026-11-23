import Link from 'next/link'
import { bonsaiShopOf } from '@/lib/bonsai-shops'
import type { CatalogProduct } from '@/lib/catalog-model'

// 商品ページ：販売している店が盆栽園・盆栽専門店のとき、その店を紹介する（楽天のショップ情報で確かめた店だけ）
export function SellerNote({ product, className = '' }: { product: CatalogProduct; className?: string }) {
  const shop = bonsaiShopOf(product)
  if (!shop) return null
  return (
    <div className={`border border-[#cfdcc4] bg-[#f3f7ef] px-4 py-3 ${className}`}>
      <p className="text-[11.5px] font-bold tracking-[0.06em] text-[#3f5a2c]">{shop.kind === 'garden' ? '盆栽園の店' : '盆栽専門店'}</p>
      <p className="mt-1 text-[13.5px] leading-[1.7] text-ink">
        {shop.kind === 'garden' ? (
          <>
            この商品は、{shop.area}の盆栽園「{shop.gardenName}」が楽天市場で営む店（{shop.name}）が販売しています。
            {shop.gardenId && <Link href={`/gardens/${shop.gardenId}`} className="ml-1 border-b border-ink text-ink hover:text-gold-dark">{shop.gardenName}の紹介を見る</Link>}
          </>
        ) : (
          <>この商品は、{shop.area}の{shop.note ? `${shop.note}の専門店` : '盆栽専門店'}（{shop.name}）が販売しています。</>
        )}
      </p>
      <Link href="/gardens/shops" className="mt-1.5 inline-flex min-h-9 items-center text-[12.5px] text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">盆栽園・専門店から直接買う ›</Link>
    </div>
  )
}
