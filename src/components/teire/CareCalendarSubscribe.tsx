import { CARE_GROUPS } from '@/lib/care-calendar'
import { careIcsPath, careIcsUrl } from '@/lib/care-ics'
import { CareIcon } from '@/components/catalog/CareIcon'

// 「手入れの予定をカレンダーに入れる」。樹種グループを選んで、スマホ・パソコンのカレンダーアプリに登録する
// iPhone・Mac は webcal: で照会（購読）、Google カレンダーは URL で追加、そのほかはファイルを保存して読み込む
export function CareCalendarSubscribe({ className = '' }: { className?: string }) {
  return (
    <section aria-labelledby="care-calendar" className={`border border-line bg-white ${className}`}>
      <div className="border-b border-line px-4 py-5 lg:px-6">
        <p className="flex items-center gap-2 text-[12px] tracking-[0.08em] text-gold-dark"><CareIcon name="season" className="h-4 w-4" />毎月、忘れずに</p>
        <h2 id="care-calendar" className="mt-1.5 font-mincho text-[20px] font-bold tracking-[0.05em] text-ink lg:text-[23px]">手入れの予定をカレンダーに入れる</h2>
        <p className="mt-2 max-w-[720px] text-[13px] leading-[1.9] text-ink-soft">
          育てている樹のグループを選ぶと、毎月1日に「今月の手入れ」がカレンダーの予定として届きます。登録は無料で、メールアドレスなどの入力もいりません。やめたいときは、カレンダーアプリから削除できます。
        </p>
      </div>
      <ul className="divide-y divide-line">
        {CARE_GROUPS.map(g => {
          const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(careIcsUrl(g.key).replace(/^https:/, 'webcal:'))}`
          const webcal = careIcsUrl(g.key).replace(/^https:/, 'webcal:')
          return (
            <li key={g.key} className="grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-2.5 px-4 py-3.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-6" data-place="care_calendar">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center bg-paper-deep text-gold-dark"><CareIcon name={g.icon} className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0">
                  <span className="block font-mincho text-[15.5px] font-bold text-ink">{g.label}</span>
                  <span className="block truncate text-[11.5px] text-ink-muted">{g.examples}</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:flex">
                <a href={webcal} data-calendar={`${g.key}_apple`} className="inline-flex min-h-11 items-center justify-center border border-ink bg-white px-3 text-[12.5px] text-ink hover:bg-ink hover:text-white">iPhone・Mac</a>
                <a href={google} target="_blank" rel="noopener noreferrer" data-calendar={`${g.key}_google`} className="inline-flex min-h-11 items-center justify-center border border-ink bg-white px-3 text-[12.5px] text-ink hover:bg-ink hover:text-white">Google</a>
                <a href={careIcsPath(g.key)} download={`bonsai-care-${g.key}.ics`} data-calendar={`${g.key}_file`} className="inline-flex min-h-11 items-center justify-center border border-line bg-white px-3 text-[12.5px] text-ink-soft hover:border-ink">ファイル</a>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="border-t border-line px-4 py-3 text-[11.5px] leading-[1.8] text-ink-muted lg:px-6">
        Android のスマホは「Google」から登録すると、Google カレンダーのアプリに表示されます。時期は関東の平地が目安です。
      </p>
    </section>
  )
}
