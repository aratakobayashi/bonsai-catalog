import { EventApplyButton } from '@/components/admin/EventApplyButton'
import eventData from '@/data/event-updates.json'

export default function AdminEventsDataPage() {
  const tentative = Object.values(eventData.meta as Record<string, { dateStatus: string }>).filter(m => m.dateStatus === 'tentative').length
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">盆栽イベントデータの反映</h1>
      <p className="text-sm text-gray-700">
        {eventData.verifiedAt}に主催者の公式サイトなどで確認したイベント{eventData.inserts.length}件（うち日程未発表の恒例行事{tentative}件）を追加し、
        確認できなかった過去のイベント{eventData.deleteIds.length}件を削除します。削除するデータは docs/growth/event-audit に保存しています。
        何度押しても同じ結果になります。
      </p>
      <EventApplyButton />
    </div>
  )
}
