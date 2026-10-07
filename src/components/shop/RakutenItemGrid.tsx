import { AFFILIATE_LINK_REL } from '@/lib/affiliate'
import { formatPrice } from '@/lib/utils'
import type { RakutenItem } from '@/lib/rakuten'

// 楽天の画像は楽天の画像サーバーでサイズ指定済みのため、Next.js の画像最適化は使わない
export function RakutenItemGrid({ items }: { items: RakutenItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <a
          key={item.code}
          href={item.url}
          target="_blank"
          rel={AFFILIATE_LINK_REL}
          className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
        >
          <div className="aspect-square bg-gray-100">
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                width={300}
                height={300}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-3 flex flex-col flex-1">
            <p className="text-sm text-gray-900 line-clamp-3 mb-2">{item.name}</p>
            <p className="text-xs text-gray-500 mb-2 truncate">{item.shopName}</p>
            <div className="mt-auto">
              <p className="text-base font-semibold text-gray-900">
                {formatPrice(item.price)}
                {item.freeShipping && <span className="ml-2 text-xs font-normal text-green-700">送料無料</span>}
              </p>
              {item.reviewCount > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  ★{item.reviewAverage.toFixed(1)}（{item.reviewCount.toLocaleString()}件）
                </p>
              )}
              <span className="mt-2 block text-center text-sm font-semibold bg-red-600 text-white rounded-lg py-2">
                楽天市場で見る
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

// 楽天ウェブサービスのクレジット表示（API 利用規約で求められている）
export function RakutenCredit() {
  return (
    <p className="text-xs text-gray-500 mt-6">
      <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">
        Supported by Rakuten Developers
      </a>
      。価格・在庫・送料は取得時点の情報です。最新の情報は楽天市場の商品ページでご確認ください。
    </p>
  )
}
