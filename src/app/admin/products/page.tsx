import { RakutenSyncButton } from '@/components/admin/RakutenSyncButton'

export default function AdminProductsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">商品の同期</h1>
      <p className="text-sm text-gray-700">
        楽天市場の商品は毎日（日本時間の午前4時ごろ）自動で同期されます。1回で約半分のカテゴリを更新するため、どの商品も2日に1回は価格・レビューが更新され、新しい商品も追加されます。
        すぐに反映したいときは、下のボタンで手動実行できます。
      </p>
      <RakutenSyncButton />
    </div>
  )
}
