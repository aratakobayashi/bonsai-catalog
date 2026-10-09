import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getArticles, getCategories } from '@/lib/database/articles'
import { ArticleList, guidesHref } from '@/components/features/ArticleList'
import { ArticleSearchBox, ArticleSortSelect } from '@/components/features/ArticleFilters'
import { CONTAINER, PageHeading } from '@/components/ui/design'

const baseMetadata: Metadata = {
  title: '盆栽ガイド記事一覧 - 盆栽コレクション',
  description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。初心者から上級者まで役立つコンテンツを豊富にご用意しています。',
  keywords: '盆栽, 育て方, 管理, ガイド, 初心者, もみじ, 松, 桜, コツ',
  openGraph: {
    title: '盆栽ガイド記事一覧 - 盆栽コレクション',
    description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '盆栽ガイド記事一覧 - 盆栽コレクション',
    description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。',
  },
}

interface ArticlesPageProps {
  searchParams: {
    category?: string
    tags?: string
    search?: string
    page?: string
    sortBy?: string
  }
}

// 絞り込み（カテゴリ・タグ・検索）は一覧トップに正規化し、ページ送りは各ページを正規URLにする
export function generateMetadata({ searchParams }: ArticlesPageProps): Metadata {
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const isFiltered = Boolean(searchParams.tags || searchParams.search || searchParams.sortBy)
  const canonical = !isFiltered && page > 1 ? `/guides?page=${page}` : '/guides'
  return {
    ...baseMetadata,
    alternates: { canonical },
    ...(isFiltered && { robots: { index: false, follow: true } }),
  }
}

// 動的レンダリングを強制してキャッシュ問題を回避
export const dynamic = 'force-dynamic'

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  // URLパラメータからフィルター条件を構築
  const filters = {
    category: searchParams.category,
    tags: searchParams.tags ? searchParams.tags.split(',') : undefined,
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 12,
    sortBy: searchParams.sortBy as 'publishedAt' | 'updatedAt' | 'readingTime' | 'title' | undefined
  }

  // 並行してデータを取得
  const [articlesData, categories] = await Promise.all([
    getArticles(filters),
    getCategories(),
  ])

  // 一覧では本文を使わないため外して HTML を軽くする
  const listData = {
    ...articlesData,
    articles: articlesData.articles.map(article => ({ ...article, content: '' })),
  }

  // 「はじめての方へ」は絞り込みのない1ページ目だけに出す
  const showBeginnerSteps = !filters.category && !filters.search && !filters.tags && filters.page === 1

  // カテゴリのタブ（下線で現在地を示す。SPは横スクロール）
  const tabClass = (active: boolean) =>
    `flex-none py-3 font-mincho text-sm font-bold lg:text-[15px] ${
      active ? 'text-ink shadow-[inset_0_-1.5px_0_#22201c]' : 'text-ink-muted hover:text-ink'
    }`
  const tabs = (
    <nav aria-label="記事のカテゴリ" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <div className="flex gap-5 border-b border-line lg:flex-wrap lg:gap-x-7">
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
        title="育て方"
        lead="盆栽の育て方から選び方まで、専門的な知識をわかりやすく解説。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '育て方' }]}
        aside={<ArticleSearchBox key={filters.search || ''} initialQuery={filters.search || ''} />}
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
              <ArticleSortSelect totalCount={articlesData.totalCount} sortBy={filters.sortBy} />
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

// 「はじめての方へ」で案内する記事（実在する初心者向け記事）
const BEGINNER_STEPS = [
  { slug: 'beginner-tree-species-guide', label: '盆栽の選び方｜最初に選ぶ樹種5選' },
  { slug: 'bonsai-watering-master-guide-2025', label: '盆栽の水やりの基本｜失敗しないコツ' },
  { slug: 'article-12', label: '置き場所と日当たり｜屋外・室内' },
]
