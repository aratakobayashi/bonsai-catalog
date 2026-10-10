import type { Metadata } from 'next'
import Link from 'next/link'
import { CARE_GROUPS, CARE_CALENDAR, getMonthCare, speciesInGroup, speciesLabel } from '@/lib/care-calendar'
import { jstMonth } from '@/lib/seasons'
import { SITE_URL } from '@/lib/site'
import { articleCards } from '@/lib/teire-server'
import { CareIcon } from '@/components/catalog/CareIcon'
import { ArticleCardGrid } from '@/components/article/RelatedArticleRows'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, NavyPanel, PageHeading, SectionTitle } from '@/components/ui/design'
import { MonthStrip } from '@/components/teire/TeireParts'
import { RelatedTools } from '@/components/layout/RelatedTools'

// 「今月」は日本時間で決める。月が替わったら1時間以内に切り替わる
export const revalidate = 3600

export const metadata: Metadata = {
  title: '今月の盆栽の手入れ｜月ごとの水やり・置き場所・作業のカレンダー - 盆栽コレクション',
  description: '盆栽の手入れを1月から12月まで月ごとにまとめました。松柏類・雑木類・花もの・実もの・さつき・室内向きの樹種グループ別に、水やりの回数の目安、置き場所、肥料、剪定や植え替えの時期と、今月見頃の樹種が分かります。時期は関東の平地が目安です。',
  alternates: { canonical: '/teire' },
}

export default function TeireIndexPage() {
  const month = jstMonth()
  const care = getMonthCare(month)

  return (
    <div className={`${CONTAINER} pb-12 lg:pb-20`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '今月の手入れ', url: `${SITE_URL}/teire`, position: 2 },
        ]}
      />
      <PageHeading
        title="今月の盆栽の手入れ"
        lead="盆栽の手入れは、季節ごとにやることがほぼ決まっています。月を選ぶと、樹種グループごとの水やり・置き場所・肥料と、その月の作業が分かります。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '今月の手入れ' }]}
      />

      {/* 今月のあらまし */}
      <section aria-labelledby="this-month" className="mt-8 border border-line bg-white lg:mt-10">
        <div className="border-b border-line px-4 py-4 lg:px-6 lg:py-5">
          <p className="text-[12px] tracking-[0.08em] text-gold-dark">今月（日本時間）</p>
          <h2 id="this-month" className="mt-1 font-mincho text-[24px] font-bold tracking-[0.06em] text-ink lg:text-[28px]">
            {month}月<span className="ml-3 text-[15px] font-bold text-ink-soft lg:text-[17px]">{care.phase}</span>
          </h2>
          <p className="mt-2 text-sm leading-[1.9] text-ink-soft">{care.lead}</p>
        </div>
        <ul className="grid grid-cols-1 divide-y divide-line md:grid-cols-2 md:divide-y-0">
          {CARE_GROUPS.map((group, i) => {
            const tasks = care.groups[group.key].tasks.filter(t => !t.only).slice(0, 3)
            return (
              <li key={group.key} className={`min-w-0 px-4 py-3.5 lg:px-6 ${i >= 2 ? 'md:border-t md:border-line' : ''} ${i % 2 === 1 ? 'md:border-l md:border-line' : ''}`}>
                <p className="flex items-center gap-2 font-mincho text-[16px] font-bold text-ink">
                  <span className="text-gold-dark"><CareIcon name={group.icon} /></span>
                  {group.label}
                </p>
                <p className="mt-1 text-[13px] leading-[1.8] text-ink-soft">
                  {tasks.length > 0 ? tasks.map(t => t.title).join('／') : '水やりと置き場所の管理が中心です'}
                </p>
              </li>
            )
          })}
        </ul>
        <div className="border-t border-line px-4 py-4 lg:px-6">
          <Link href={`/teire/${month}`} className="flex h-12 w-full items-center justify-center bg-sumi px-8 text-sm font-bold tracking-[0.06em] text-white hover:bg-sumi-light hover:text-white lg:w-auto lg:justify-self-start lg:inline-flex">
            {month}月の手入れをくわしく見る ›
          </Link>
        </div>
      </section>

      {/* 12か月 */}
      <section aria-labelledby="months" className="mt-12 lg:mt-16">
        <SectionTitle>
          <span id="months">月を選ぶ</span>
        </SectionTitle>
        <MonthStrip current={month} className="mt-4" />
        <ol className="mt-6 grid grid-cols-1 border-t border-line md:grid-cols-2 md:gap-x-8">
          {CARE_CALENDAR.map(m => (
            <li key={m.month} className="min-w-0 border-b border-line">
              <Link href={`/teire/${m.month}`} className="group flex min-h-[56px] items-baseline gap-3 py-3 text-ink hover:text-ink">
                <span className="w-10 flex-none font-mincho text-[17px] font-bold">{m.month}月</span>
                <span className="min-w-0">
                  <span className="text-[13px] font-bold text-ink-soft">{m.phase}</span>
                  <span className="mt-0.5 block line-clamp-2 text-[13px] leading-[1.7] text-ink-muted group-hover:text-gold-dark">{m.lead}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* グループの見分け方 */}
      <section aria-labelledby="groups" className="mt-12 lg:mt-16">
        <SectionTitle>
          <span id="groups">樹種グループの分け方</span>
        </SectionTitle>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">作業の時期が近い樹種どうしをまとめています。樹種ごとの細かな違いは、それぞれの育て方の記事で確かめてください。</p>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {CARE_GROUPS.map(group => (
            <div key={group.key} className="grid grid-cols-1 gap-1 py-3 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
              <dt className="flex items-center gap-2 font-bold text-ink">
                <span className="text-gold-dark"><CareIcon name={group.icon} /></span>
                {group.label}
              </dt>
              <dd className="text-[13px] leading-[1.8] text-ink-soft">{speciesInGroup(group.key).map(speciesLabel).join('・')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="basics" className="mt-12 lg:mt-16">
        <SectionTitle>
          <span id="basics">一年の手入れの基本</span>
        </SectionTitle>
        <div className="mt-5">
          <ArticleCardGrid items={articleCards(['bonsai-annual-care-calendar-2025', 'bonsai-watering-master-guide-2025', 'bonsai-pruning-master-guide-2025', 'bonsai-repotting-master-guide-2025'])} />
        </div>
      </section>

      <NavyPanel
        href="/note"
        eyebrow="わたしの盆栽ノート"
        title="育てている盆栽を登録すると、その樹の今月やることだけを表示します ›"
        className="mt-12 lg:mt-16"
      />
      <RelatedTools hrefs={['/shojo', '/hajimete', '/zukan']} />
    </div>
  )
}
