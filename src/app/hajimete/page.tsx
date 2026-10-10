import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { Checklist, ChecklistProgress, type ChecklistEntry } from '@/components/hajimete/Checklist'
import { ArticleCardGrid, type ArticleCardItem } from '@/components/article/RelatedArticleRows'
import { getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import { jstMonth } from '@/lib/seasons'
import { SITE_URL } from '@/lib/site'
import { ALL_CHECK_IDS, KINDS, STAGES, parseKind, seasonNote } from '@/lib/hajimete'

export const metadata: Metadata = {
  title: 'はじめての1か月ガイド｜盆栽が届いた日から1か月の世話をチェックリストで - 盆栽コレクション',
  description: '盆栽が届いた日、1〜3日目、1週目、2週目、3〜4週目にやることをチェックリストにまとめました。樹の種類（松柏類・雑木類・花もの・実もの・さつき・室内向き）を選ぶと、置き場所と水やりの助言も合わせて表示します。チェックは保存できます。',
  alternates: { canonical: '/hajimete' },
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default function HajimetePage({ searchParams }: PageProps) {
  const kind = parseKind(searchParams)
  const season = seasonNote(jstMonth())
  const articleSlugs = [...(kind?.articles ?? []), 'article-11', 'bonsai-online-sales-complete-guide', 'bonsai-watering-master-guide-2025', 'article-12']
  const articles: ArticleCardItem[] = articleSlugs
    .filter((slug, i, list) => list.indexOf(slug) === i)
    .slice(0, 6)
    .map(slug => ({ href: `/guides/${slug}`, title: getArticleOverride(slug)?.title ?? '', image: thumbnailPath(slug) }))
    .filter(item => item.title)

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: 'はじめての1か月ガイド', url: `${SITE_URL}/hajimete`, position: 2 },
        ]}
      />
      <div className={`${CONTAINER} pb-14 lg:pb-20`}>
        <PageHeading
          title="はじめての1か月ガイド"
          lead="盆栽が届いた日から1か月の世話を、順にチェックしながら進められます。剪定や植え替えは、樹に慣れてからで間に合います。最初の1か月は、水やりと置き場所に慣れる期間です。"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: 'はじめての1か月ガイド' }]}
        />

        {/* 樹の種類（リンクで切り替える。JavaScript がなくても動く） */}
        <fieldset className="mt-6 min-w-0 border-y border-line py-5 lg:mt-10 lg:py-7">
          <legend className="sr-only">樹の種類</legend>
          <p className="text-[13px] font-bold text-ink">樹の種類を選ぶと、置き場所と水やりの助言を添えます</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {KINDS.map(option => {
              const active = kind?.value === option.value
              return (
                <Link
                  key={option.value}
                  href={`/hajimete?shu=${option.value}#list`}
                  scroll={false}
                  aria-current={active ? 'true' : undefined}
                  className={`flex min-h-12 flex-col justify-center border px-3.5 py-1.5 text-left ${active ? 'border-ink bg-ink text-white hover:text-white' : 'border-line bg-paper text-ink hover:border-ink'}`}
                >
                  <span className="text-[14px] font-bold leading-snug">{option.label}</span>
                  <span className={`text-[11px] leading-snug ${active ? 'text-white/80' : 'text-ink-muted'}`}>{option.note}</span>
                </Link>
              )
            })}
            {kind && (
              <Link href="/hajimete#list" scroll={false} className="flex min-h-12 items-center border border-line bg-white px-3.5 text-[13px] text-ink-muted hover:border-ink hover:text-ink">
                選ばない
              </Link>
            )}
          </div>
          {!kind && <p className="mt-3 text-[12px] text-ink-muted">樹の種類が分からないときは、添えられた説明書きや商品ページの樹種名を確かめてください。</p>}
        </fieldset>

        {kind && (
          <section className="mt-6 grid gap-3 lg:mt-8 lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-6">
            {[
              { title: '置き場所', text: kind.place },
              { title: '水やり', text: kind.water },
              { title: '気をつけたいこと', text: kind.care },
            ].map(block => (
              <div key={block.title} className="min-w-0 border border-line bg-white px-4 py-4 lg:px-5">
                <h2 className="text-[12.5px] tracking-[0.08em] text-gold-dark">{kind.label}の{block.title}</h2>
                <p className="mt-1.5 text-[13.5px] leading-[1.85] text-ink">{block.text}</p>
              </div>
            ))}
          </section>
        )}

        <div className="mt-6 border-l-2 border-gold bg-white px-4 py-3.5 lg:mt-8">
          <p className="text-[12.5px] font-bold text-ink">今の季節：{season.label}</p>
          <p className="mt-1 text-[13px] leading-[1.85] text-ink-soft">{season.text}</p>
          <p className="mt-1 text-[11.5px] text-ink-muted">関東の平地の目安です。寒い地域・暖かい地域では時期がずれます。</p>
        </div>

        <section id="list" className="scroll-mt-20 pt-10 lg:pt-14">
          <SectionTitle>1か月のチェックリスト</SectionTitle>
          <div className="mt-3">
            <ChecklistProgress ids={ALL_CHECK_IDS} />
          </div>

          {/* 目次 */}
          <nav aria-label="時期" className="mt-5 flex flex-wrap gap-2">
            {STAGES.map(stage => (
              <a key={stage.key} href={`#${stage.key}`} className="inline-flex min-h-[44px] items-center border border-line bg-white px-3.5 text-[13px] text-ink hover:border-ink">
                {stage.label}
              </a>
            ))}
          </nav>

          <ol className="mt-4">
            {STAGES.map((stage, i) => {
              const entries: ChecklistEntry[] = stage.items.map(item => ({
                id: item.id,
                text: item.text,
                tip: kind && item.tip ? kind[item.tip] : undefined,
                link: item.link,
              }))
              return (
                <li key={stage.key} id={stage.key} className="scroll-mt-20 pt-8 lg:pt-10">
                  <h3 className="flex items-baseline gap-3 font-mincho text-[19px] font-bold tracking-[0.05em] text-ink lg:text-[22px]">
                    <span className="text-[13px] text-gold-dark">{String(i + 1).padStart(2, '0')}</span>
                    {stage.label}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.85] text-ink-soft">{stage.summary}</p>
                  <Checklist items={entries} />
                </li>
              )
            })}
          </ol>
        </section>

        <section className="pt-12 lg:pt-16">
          <SectionTitle>困ったときと、次にやること</SectionTitle>
          <ul className="mt-4 grid gap-2 text-[14px] sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            {[
              { href: '/shojo', label: '症状から調べる', note: '葉が黄色い・しおれる・虫がいるときの原因と対処' },
              { href: '/guides/bonsai-watering-master-guide-2025', label: '盆栽の水やり', note: '乾いたかの見分け方と、季節ごとの回数の目安' },
              { href: '/guides/article-12', label: '盆栽の置き場所', note: '日当たり・風通しの考え方と、季節ごとの移し方' },
              { href: '/teire', label: '手入れの時期', note: '剪定・植え替えなど、これから先の作業の予定' },
              { href: kind ? `/soroeru?group=${kind.soroeruGroup}&size=small&purpose=start#list` : '/soroeru', label: '鉢・土・道具をそろえる', note: 'はさみ・じょうろなど、最初にそろえる道具' },
            ].map(link => (
              <li key={link.label}>
                <Link href={link.href} className="flex min-h-[52px] flex-col justify-center border border-line bg-white px-4 py-2.5 hover:border-ink">
                  <span className="font-bold text-ink">{link.label}</span>
                  <span className="text-[12px] text-ink-muted">{link.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {articles.length > 0 && (
          <section className="pt-12 lg:pt-16">
            <SectionTitle action={<Link href="/guides" className="border-b border-ink pb-0.5 text-[13px] text-ink">記事をすべて見る</Link>}>くわしく読む</SectionTitle>
            <div className="mt-4 lg:mt-6">
              <ArticleCardGrid items={articles} />
            </div>
          </section>
        )}
      </div>
    </>
  )
}
