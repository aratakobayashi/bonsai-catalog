import { GardenApplyButton } from '@/components/admin/GardenApplyButton'
import updates from '@/data/garden-updates.json'
import verification from '@/data/garden-verification.json'

export default function AdminGardensPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">盆栽園データの反映</h1>
      <p className="text-sm text-gray-700">
        {verification.verifiedAt}に公式サイトなどの公開情報と照合した結果を、データベースに反映します。
        既存の{updates.updates.length}園の情報を正しい内容に更新し、新しく確認できた{updates.inserts.length}園を追加します。
        実在を確認できない園・閉園した園・盆栽を扱わない園（{verification.hiddenIds.length}園）はサイトに表示しません。
        何度押しても同じ結果になります。
      </p>
      <GardenApplyButton />
    </div>
  )
}
