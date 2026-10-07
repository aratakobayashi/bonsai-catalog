import { RakutenSyncButton } from '@/components/admin/RakutenSyncButton'

export default function AdminProductsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">商品の同期</h1>
      <p className="text-sm text-gray-700">
        楽天市場の商品は3日ごと（日本時間の午前4時ごろ）に自動で同期され、価格・レビューの更新と新しい商品の追加が行われます。
        すぐに反映したいときは、下のボタンで手動実行できます。
      </p>
      <RakutenSyncButton />
    </div>
  )
}
