import Link from 'next/link'
import { CareIcon } from '@/components/catalog/CareIcon'
import { PotPreview } from '@/components/kumiawase/PotPreview'
import { SITE_TOOLS } from '@/components/layout/site-tools'
import { CARE_GROUPS, getMonthCare } from '@/lib/care-calendar'
import type { KumiState } from '@/lib/kumiawase'

// トップの「迷ったら、ここから」：よく使う3つは中身が見えるカードで、残りは小さなボタンで並べる
const MAIN = ['/shindan', '/kumiawase', '/teire']

// 診断の最初の質問（/shindan の1問目と同じ選択肢。押すとその答えを選んだ状態で診断が開く）
const FIRST_QUESTION = {
  title: 'どなたが育てますか？',
  options: [
    { value: 'first', label: '自分用（はじめて）' },
    { value: 'self', label: '自分用（経験あり）' },
    { value: 'gift', label: '贈り物にしたい' },
  ],
}

// 組み合わせの見本の絵（もみじ・青い丸鉢・苔付き）
const SAMPLE: KumiState = { tree: 'momiji', size: 'small', color: 'bluegreen', shape: 'round', finishes: ['moss'], step: 'result' }

// 今月の手入れから、カードに出す3行（どの樹にも共通すること→樹種のグループごとの最初の作業）
function monthHighlights(month: number): { who: string; title: string }[] {
  const care = getMonthCare(month)
  const rows = care.common.map(task => ({ who: 'どの樹も', title: task.title }))
  for (const group of CARE_GROUPS) {
    const task = care.groups[group.key]?.tasks[0]
    if (task && !rows.some(r => r.title === task.title)) rows.push({ who: group.label, title: task.title })
  }
  return rows.slice(0, 3)
}

const cardClass = 'flex min-w-0 flex-col border border-line bg-white'
const eyebrowClass = 'flex items-center gap-2 text-[12.5px] font-bold tracking-[0.06em] text-gold-dark'
const titleClass = 'mt-2 font-mincho text-[18px] font-bold leading-[1.5] tracking-[0.04em] text-ink lg:text-[19px]'
const moreClass = 'mt-auto flex min-h-12 items-center justify-between border-t border-line px-4 text-[13.5px] font-bold text-ink hover:text-gold-dark lg:px-5'

export function HomeTools({ month, readyCount }: { month: number; readyCount: number }) {
  const care = getMonthCare(month)
  const highlights = monthHighlights(month)
  const others = SITE_TOOLS.filter(t => !MAIN.includes(t.href))

  return (
    <section className="pt-12 lg:pt-24" aria-labelledby="home-tools">
      <p className="text-[12px] tracking-[0.12em] text-gold-dark">盆栽コレクションの使い方</p>
      <h2 id="home-tools" className="mt-1.5 font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">迷ったら、ここから</h2>
      <p className="mt-2 text-[13.5px] leading-[1.8] text-ink-soft lg:text-sm">質問に答える、組み合わせて選ぶ、今月やることを確かめる。目的に合わせて使えます。</p>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 lg:mt-8 lg:grid-cols-3 lg:gap-6">
        {/* かんたん盆栽診断：1問目をその場で答えられる */}
        <div className={cardClass}>
          <div className="px-4 pb-5 pt-4 lg:px-5 lg:pt-5">
            <p className={eyebrowClass}><CareIcon name="question" className="h-5 w-5" />かんたん盆栽診断</p>
            <p className={titleClass}>4つの質問で、合う盆栽を探す</p>
            <div className="mt-4 bg-paper-deep px-3.5 py-4">
              <p className="text-[13px] font-bold text-ink">Q1. {FIRST_QUESTION.title}</p>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2">
                {FIRST_QUESTION.options.map(option => (
                  <Link key={option.value} href={`/shindan?who=${option.value}#shindan-form`} className="flex min-h-11 items-center justify-between border border-line bg-white px-3.5 text-[13.5px] text-ink hover:border-ink">
                    {option.label}<span aria-hidden="true" className="text-ink-muted">›</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/shindan" className={moreClass}>置き場所・予算・楽しみ方も選んで探す<span aria-hidden="true">›</span></Link>
        </div>

        {/* 組み合わせで選ぶ：見本の絵と、選ぶ順番 */}
        <Link href="/kumiawase" className={`${cardClass} group hover:border-gold`}>
          <div className="px-4 pb-5 pt-4 lg:px-5 lg:pt-5">
            <p className={eyebrowClass}><CareIcon name="bonsai" className="h-5 w-5" />組み合わせで選ぶ</p>
            <p className={titleClass}>樹・鉢・仕上げを選んで、自分だけの一鉢</p>
            <div className="mt-4 flex items-center gap-3 bg-paper-deep px-3 py-3">
              <PotPreview state={SAMPLE} className="h-[104px] w-[124px] flex-none" />
              <ol className="min-w-0 space-y-1.5 text-[12.5px] text-ink">
                {['樹を選ぶ', '大きさを選ぶ', '鉢の色と形', '苔・石などの仕上げ'].map((step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-ink text-[11px]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-3 text-[12.5px] leading-[1.7] text-ink-soft">
              植え付け済みで届く{readyCount > 0 ? <strong className="mx-0.5 text-ink">{readyCount.toLocaleString()}鉢</strong> : '盆栽'}から、近いものを探します。
            </p>
          </div>
          <span className={`${moreClass} group-hover:text-gold-dark`}>組み合わせを選ぶ<span aria-hidden="true">›</span></span>
        </Link>

        {/* 今月の手入れ：今月の作業を3行 */}
        <div className={cardClass}>
          <div className="px-4 pb-5 pt-4 lg:px-5 lg:pt-5">
            <p className={eyebrowClass}><CareIcon name="season" className="h-5 w-5" />{month}月の手入れ</p>
            <p className={titleClass}>今月の主な作業<span className="ml-2 align-middle border border-line px-2 py-0.5 font-sans text-[11.5px] font-normal tracking-normal text-ink-soft">{care.phase}</span></p>
            <ul className="mt-4 border-t border-line">
              {highlights.map(row => (
                <li key={row.title} className="flex gap-3 border-b border-line py-2.5 text-[13.5px] leading-[1.6]">
                  <span className="w-[64px] flex-none text-[12px] leading-[1.9] text-ink-muted">{row.who}</span>
                  <span className="min-w-0 font-bold text-ink">{row.title}</span>
                </li>
              ))}
            </ul>
            <Link href="/note" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[12.5px] text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
              <CareIcon name="note" className="h-4 w-4 text-gold-dark" />育てている樹だけ表示する（盆栽ノート）
            </Link>
          </div>
          <Link href={`/teire/${month}`} className={moreClass}>{month}月の手入れをすべて見る<span aria-hidden="true">›</span></Link>
        </div>
      </div>

      {/* そのほかの機能 */}
      <ul className="mt-4 grid grid-cols-2 gap-2.5 lg:mt-6 lg:grid-cols-6 lg:gap-4">
        {others.map(t => (
          <li key={t.href} className="min-w-0">
            <Link href={t.href} className="flex h-full min-h-[64px] flex-col justify-center gap-1 border border-line bg-white px-3 py-2.5 hover:border-gold lg:items-center lg:px-2 lg:py-4 lg:text-center">
              <span className="flex items-center gap-1.5 text-[13px] font-bold leading-snug tracking-[-0.01em] text-ink lg:flex-col lg:gap-1.5 lg:text-[13.5px]">
                <CareIcon name={t.icon} className="h-5 w-5 text-gold-dark" />{t.label}
              </span>
              <span className="text-[11.5px] leading-[1.5] text-ink-muted">{t.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
