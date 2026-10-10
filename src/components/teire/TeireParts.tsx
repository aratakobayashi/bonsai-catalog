// 「今月の手入れ」（/teire）の部品：12か月の切り替え、樹種グループのカード、作業の行
import Link from 'next/link'
import { CareIcon } from '@/components/catalog/CareIcon'
import {
  TASK_ICON,
  taskTargetLabel,
  type CareGroup,
  type CareTask,
  type GroupMonthCare,
} from '@/lib/care-calendar'

export interface GuideLink {
  slug: string
  title: string
}

// 12か月の切り替え（SP は6列×2段、PC は12列）
export function MonthStrip({ active, current, className = '' }: { active?: number; current: number; className?: string }) {
  return (
    <nav aria-label="月を選ぶ" className={className}>
      <ol className="grid grid-cols-6 border-l border-t border-line lg:grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
          const isActive = m === active
          return (
            <li key={m} className="min-w-0 border-b border-r border-line">
              <Link
                href={`/teire/${m}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[52px] flex-col items-center justify-center px-1 py-1.5 text-center ${
                  isActive ? 'bg-sumi text-white hover:text-white' : 'bg-white text-ink hover:bg-paper-deep hover:text-ink'
                }`}
              >
                <span className="font-mincho text-[15px] font-bold leading-none tracking-[0.04em]">{m}月</span>
                {m === current && <span className={`mt-1 text-[10.5px] leading-none ${isActive ? 'text-white' : 'text-gold-dark'}`}>今月</span>}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// 作業の1行（アイコン＋太字の作業名＋短い説明）
export function TaskRow({ task, showTarget = true }: { task: CareTask; showTarget?: boolean }) {
  const target = showTarget ? taskTargetLabel(task) : null
  return (
    <li className="flex gap-2.5 py-2.5">
      <span className="mt-0.5 text-gold-dark">
        <CareIcon name={TASK_ICON[task.kind]} />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] leading-relaxed text-ink">
          <span className="font-bold">{task.title}</span>
          {target && <span className="ml-2 inline-block border border-line bg-paper px-1.5 text-[11px] font-normal leading-[18px] text-ink-soft">{target}</span>}
        </p>
        <p className="mt-0.5 text-[13px] leading-[1.8] text-ink-soft">{task.text}</p>
      </div>
    </li>
  )
}

// 水やり・置き場所・肥料の3行
export function BasicsList({ care }: { care: Pick<GroupMonthCare, 'water' | 'place' | 'fertilizer'> }) {
  const rows = [
    { icon: 'water', label: '水やり', text: care.water },
    { icon: 'place', label: '置き場所', text: care.place },
    { icon: 'level', label: '肥料', text: care.fertilizer },
  ]
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map(row => (
        <div key={row.label} className="grid grid-cols-[80px_minmax(0,1fr)] gap-2 py-2.5">
          <dt className="flex items-start gap-1.5 text-[13px] font-bold text-ink">
            <span className="mt-0.5 text-gold-dark"><CareIcon name={row.icon} className="h-4 w-4" /></span>
            {row.label}
          </dt>
          <dd className="text-[13px] leading-[1.8] text-ink-soft">{row.text}</dd>
        </div>
      ))}
    </dl>
  )
}

// 樹種グループのカード（その月の水やり・置き場所・肥料と作業）
export function GroupCareCard({ group, care, guides }: { group: CareGroup; care: GroupMonthCare; guides: GuideLink[] }) {
  return (
    <section aria-labelledby={`group-${group.key}`} className="flex min-w-0 flex-col border border-line bg-white">
      <header className="flex items-start gap-3 border-b border-line px-4 py-3.5 lg:px-5">
        <span className="flex h-10 w-10 flex-none items-center justify-center bg-paper-deep text-ink">
          <CareIcon name={group.icon} className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0">
          <h3 id={`group-${group.key}`} className="scroll-mt-24 font-mincho text-[18px] font-bold tracking-[0.06em] text-ink">{group.label}</h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{group.examples}</p>
        </div>
      </header>
      <div className="flex-1 px-4 pb-2 pt-3 lg:px-5">
        <BasicsList care={care} />
        {care.tasks.length > 0 && (
          <>
            <h4 className="mt-4 text-[12px] font-bold tracking-[0.08em] text-ink-muted">今月の作業</h4>
            <ul className="divide-y divide-line">
              {care.tasks.map(task => (
                <TaskRow key={`${task.title}-${task.only?.join() ?? ''}-${task.except?.join() ?? ''}`} task={task} />
              ))}
            </ul>
          </>
        )}
      </div>
      <footer className="border-t border-line px-4 py-3 lg:px-5">
        <ul className="flex flex-col">
          {guides.map(guide => (
            <li key={guide.slug}>
              <Link href={`/guides/${guide.slug}`} className="flex min-h-11 items-center text-[13px] text-ink hover:text-gold-dark">
                <span className="line-clamp-2">{guide.title} ›</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={group.productsHref} className="flex min-h-11 items-center text-[13px] font-bold text-ink hover:text-gold-dark">
              {group.label}の盆栽を見る ›
            </Link>
          </li>
        </ul>
      </footer>
    </section>
  )
}
