import Link from 'next/link'
import { Suspense } from 'react'
import type { Article, ArticleCategory } from '@/types'
import { SITE_TOOLS } from '@/components/layout/site-tools'
import { CareIcon } from '@/components/catalog/CareIcon'
import { ArticleList, guidesHref } from '@/components/features/ArticleList'
import { ArticleSearchBox, ArticleSortSelect } from '@/components/features/ArticleFilters'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { heroPhoto } from '@/lib/hero-photo'

// 記事一覧に使うデータ（本文は除く）。ビルド時に作り、条件付きのURLではブラウザで /data/articles.json から読む
export interface GuidesData {
  articles: Article[]
  categories: ArticleCategory[]
}

const PAGE_LIMIT = 12

const parsePage = (value?: string) => {
  const page = value ? parseInt(value, 10) : 1
  return Number.isFinite(page) && page >= 1 ? page : 1
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// 並び順（読む時間が未設定の記事は最後。同じ値のときは新しい順）
function sortArticles(list: Article[], sortBy: (typeof SORT_VALUES)[number]): Article[] {
  const byPublished = (a: Article, b: Article) => b.publishedAt.localeCompare(a.publishedAt)
  const sorted = [...list]
  if (sortBy === 'updatedAt') sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || byPublished(a, b))
  else if (sortBy === 'readingTime') sorted.sort((a, b) => (a.readingTime ?? Infinity) - (b.readingTime ?? Infinity) || byPublished(a, b))
  else if (sortBy === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'ja') || byPublished(a, b))
  else sorted.sort(byPublished)
  return sorted
}

// 記事一覧（/guides）の中身。カテゴリ・キーワード・並び順・ページは、手元のデータで絞って並べる
export function GuidesView({ data, params }: { data: GuidesData; params: Record<string, string | string[] | undefined> }) {
  const sortBy = SORT_VALUES.find(value => value === first(params.sortBy))
  const filters = {
    category: first(params.category),
    search: first(params.search)?.trim() || undefined,
    page: parsePage(first(params.page)),
    limit: PAGE_LIMIT,
    sortBy,
  }
  const { categories } = data
  const search = filters.search?.toLowerCase()
  const matched = sortArticles(
    data.articles
      .filter(a => !filters.category || a.category.slug === filters.category)
      .filter(a => !search || `${a.title} ${a.excerpt ?? ''}`.toLowerCase().includes(search)),
    sortBy ?? 'publishedAt',
  )
  const totalPages = Math.ceil(matched.length / PAGE_LIMIT)
  // 範囲外のページ番号は最後のページを出す
  const currentPage = Math.min(filters.page, Math.max(1, totalPages))
  const listData = {
    articles: matched.slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT),
    totalCount: matched.length,
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }

  // 「はじめての方へ」は絞り込みのない1ページ目だけに出す
  const showBeginnerSteps = !filters.category && !filters.search && filters.page === 1

  // カテゴリのタブ（下線で現在地を示す。SPは横スクロール）
  const tabClass = (active: boolean) =>
    `flex min-h-11 flex-none items-center whitespace-nowrap font-mincho text-sm font-bold lg:text-[15px] ${
      active ? 'text-ink shadow-[inset_0_-1.5px_0_#22201c]' : 'text-ink-muted hover:text-ink'
    }`
  const tabs = (
    <nav aria-label="記事のカテゴリ" className="guides-tabs -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <div className="flex w-max min-w-full gap-5 border-b border-line lg:gap-6">
        <Link href={guidesHref(filters, { category: undefined })} className={tabClass(!filters.category)} aria-current={!filters.category ? 'page' : undefined}>
          すべて
        </Link>
        {categories.map(category => {
          const active = filters.category === category.slug
          return (
            <Link key={category.id} href={guidesHref(filters, { category: category.slug })} className={tabClass(active)} aria-current={active ? 'page' : undefined}>
              {category.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-20`}>
      <PageHeading
        eyebrow="育て方"
        photo={heroPhoto('/images/articles/photos/article-20-1.jpg', '幹のうねりが見える真柏の盆栽')}
        title="育て方"
        lead="盆栽の育て方から選び方まで、専門的な知識をわかりやすく解説。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '育て方' }]}
        aside={<Suspense fallback={null}><ArticleSearchBox key={filters.search || ''} initialQuery={filters.search || ''} /></Suspense>}
      />

      {/* はじめての方へ（PCは見出し＋3列、SPは線で区切った3行） */}
      {showBeginnerSteps && (
        <section className="mt-8 lg:mt-14 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16" aria-labelledby="beginner-steps">
          <div>
            <h2 id="beginner-steps" className="text-[11px] tracking-[0.08em] text-ink-muted lg:font-mincho lg:text-[22px] lg:font-bold lg:tracking-[0.06em] lg:text-ink">
              はじめての方へ
            </h2>
            <p className="mt-2.5 hidden text-[13.5px] leading-[2] text-ink-soft lg:block">この3つを読めば、最初の一年は困りません。</p>
          </div>
          <ol className="mt-2 border-t border-line lg:mt-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:border-0">
            {BEGINNER_STEPS.map((step, i) => (
              <li key={step.slug} className="border-b border-line lg:border-b-0 lg:border-t lg:border-ink">
                <Link href={`/guides/${step.slug}`} className="group flex gap-3.5 py-3 lg:block lg:pb-0 lg:pt-4">
                  <span className="font-mincho text-[17px] font-bold text-gold-dark lg:block lg:text-[22px]" aria-hidden="true">{KANJI_NUM[i]}</span>
                  <span className="font-mincho text-[14.5px] font-bold leading-[1.55] text-ink group-hover:text-gold-dark lg:mt-1.5 lg:block lg:text-base lg:leading-[1.6]">
                    {step.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 育てる道具（今月の手入れ・症状・1か月・図鑑・ノート） */}
      {showBeginnerSteps && (
        <nav aria-label="育てる道具" className="mt-8 flex gap-2 overflow-x-auto pb-1 lg:mt-12 lg:flex-wrap lg:overflow-visible">
          {SITE_TOOLS.filter(t => t.group === 'grow').map(t => (
            <Link key={t.href} href={t.href} className="inline-flex min-h-11 flex-none items-center gap-1.5 border border-line bg-paper px-3.5 text-[13px] text-ink hover:border-ink">
              <CareIcon name={t.icon} className="h-4 w-4 text-gold-dark" />{t.label}
            </Link>
          ))}
        </nav>
      )}

      {/* カテゴリ・件数・並び順 */}
      <div className={showBeginnerSteps ? 'mt-8 lg:mt-20' : 'mt-6 lg:mt-12'}>
        {tabs}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-ink-muted lg:pt-4">
          {filters.search && (
            <p>
              「<span className="font-bold text-ink">{filters.search}</span>」の検索結果
              <Link href={guidesHref(filters, { search: undefined })} className="ml-2 border-b border-ink pb-0.5 text-ink">検索を解除</Link>
            </p>
          )}
          <div className="ml-auto">
            <Suspense fallback={null}>
              <ArticleSortSelect totalCount={listData.totalCount} sortBy={filters.sortBy} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="lg:mt-6">
        <ArticleList articlesData={listData} currentFilters={filters} />
      </div>
    </div>
  )
}

const KANJI_NUM = ['一', '二', '三']

const SORT_VALUES = ['publishedAt', 'updatedAt', 'readingTime', 'title'] as const

// 「はじめての方へ」で案内する記事（実在する初心者向け記事）
const BEGINNER_STEPS = [
  { slug: 'beginner-tree-species-guide', label: '初心者に向く樹種の選び方｜置き場所と楽しみ方で選ぶ' },
  { slug: 'bonsai-watering-master-guide-2025', label: '盆栽の水やり｜乾いたかの見分け方と季節ごとの回数' },
  { slug: 'article-12', label: '盆栽の置き場所の決め方｜日当たり・風通しと季節の移し方' },
]
