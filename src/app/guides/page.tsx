import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getArticles, getCategories } from '@/lib/database/articles'
import { ArticleList, guidesHref } from '@/components/features/ArticleList'
import { ArticleSearchBox, ArticleSortSelect } from '@/components/features/ArticleFilters'
import { CONTAINER, PageHeading, ChipLink, SectionTitle } from '@/components/ui/design'

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

  const chips = (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
      <span className="flex-none">
        <ChipLink href={guidesHref(filters, { category: undefined })} active={!filters.category}>すべて</ChipLink>
      </span>
      {categories.map(category => (
        <span key={category.id} className="flex-none">
          <ChipLink href={guidesHref(filters, { category: category.slug })} active={filters.category === category.slug}>
            {category.name}
          </ChipLink>
        </span>
      ))}
    </div>
  )

  return (
    <div className={`${CONTAINER} pb-12`}>
      <PageHeading
        title="育て方"
        lead="盆栽の育て方から選び方まで、専門的な知識をわかりやすく解説。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '育て方' }]}
        aside={<ArticleSearchBox key={filters.search || ''} initialQuery={filters.search || ''} />}
      />

      {/* PC：はじめての方へ（3ステップ） */}
      {showBeginnerSteps && (
        <section className="mt-8 hidden lg:block">
          <SectionTitle>はじめての方へ</SectionTitle>
          <ol className="mt-3 grid grid-cols-3 gap-4">
            {BEGINNER_STEPS.map((step, i) => (
              <li key={step.slug}>
                <Link href={`/guides/${step.slug}`} className="block h-full rounded-[14px] bg-navy px-5 py-4 text-white hover:bg-navy-light">
                  <div className="font-mono text-[11px] tracking-[0.1em] text-[#e9c793]">STEP {i + 1}</div>
                  <div className="mt-1.5 font-mincho text-[17px] font-bold leading-snug">{step.label}</div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* カテゴリと件数・並び順 */}
      <div className="mt-5 lg:mt-8 lg:flex lg:items-center lg:gap-4">
        <div className="min-w-0 lg:flex-1">{chips}</div>
        <div className="hidden flex-none lg:block">
          <Suspense fallback={null}>
            <ArticleSortSelect totalCount={articlesData.totalCount} sortBy={filters.sortBy} />
          </Suspense>
        </div>
      </div>

      {/* SP：はじめての方へ（開くと3記事） */}
      {showBeginnerSteps && (
        <details className="group mt-4 rounded-[14px] bg-navy text-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center px-4 py-3.5 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-[#e9c793]">はじめての方へ</span>
              <span className="mt-0.5 block font-mincho text-[15px] font-bold">盆栽の選び方・水やり・置き場所の3記事</span>
            </span>
            <span className="ml-2 text-xs text-[#e9c793] transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
          </summary>
          <ol className="border-t border-white/15 px-4 pb-3">
            {BEGINNER_STEPS.map((step, i) => (
              <li key={step.slug}>
                <Link href={`/guides/${step.slug}`} className="flex items-baseline gap-2 py-2.5 text-sm">
                  <span className="font-mono text-[11px] text-[#e9c793]">STEP {i + 1}</span>
                  <span className="font-mincho font-bold">{step.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </details>
      )}

      {/* 検索中の表示と件数（SPは並び順もここ） */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-soft lg:mt-5">
        {filters.search && (
          <p>
            「<span className="font-bold text-ink">{filters.search}</span>」の検索結果
            <Link href={guidesHref(filters, { search: undefined })} className="ml-2 text-gold-dark underline">検索を解除</Link>
          </p>
        )}
        <div className="ml-auto lg:hidden">
          <Suspense fallback={null}>
            <ArticleSortSelect totalCount={articlesData.totalCount} sortBy={filters.sortBy} />
          </Suspense>
        </div>
      </div>

      <div className="mt-3">
        <ArticleList articlesData={listData} currentFilters={filters} />
      </div>
    </div>
  )
}

// 「はじめての方へ」で案内する記事（実在する初心者向け記事）
const BEGINNER_STEPS = [
  { slug: 'beginner-tree-species-guide', label: '盆栽の選び方｜最初に選ぶ樹種5選' },
  { slug: 'bonsai-watering-master-guide-2025', label: '盆栽の水やりの基本｜失敗しないコツ' },
  { slug: 'article-12', label: '置き場所と日当たり｜屋外・室内' },
]
