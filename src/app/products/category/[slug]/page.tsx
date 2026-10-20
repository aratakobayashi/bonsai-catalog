import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { SHOP_NAMES, SHOP_NAMES_AND } from '@/lib/affiliate'
import { getCatalogProducts } from '@/lib/catalog-data'
import { SHOP_CATEGORIES, getShopCategory } from '@/lib/shop-categories'
import { CategoryView } from './CategoryView'
import { CategoryClient } from './CategoryClient'

interface CategoryPageProps {
  params: { slug: string }
}

// すべてのカテゴリのページをビルド時に作り置きする
export const dynamicParams = false

export function generateStaticParams() {
  return SHOP_CATEGORIES.map(category => ({ slug: category.slug }))
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = getShopCategory(params.slug)
  if (!category) return {}
  return {
    title: category.group === 'tree' && !/盆栽|苔玉|もの$/.test(category.name)
      ? `${category.name}の盆栽の値段・相場と通販｜価格帯・大きさ別に比較 - 盆栽コレクション`
      : `${category.name}の通販・価格比較｜${SHOP_NAMES}の人気商品 - 盆栽コレクション`,
    description: `${category.name}を${SHOP_NAMES_AND}の商品から比較。価格帯・送料込・レビュー件数で選べます。${category.intro}`.slice(0, 160),
    alternates: { canonical: `/products/category/${category.slug}` },
  }
}

// 条件なしの一覧を作り置きし、条件付きのURL（?sort=price_asc など）はブラウザで描き直す
export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = getShopCategory(params.slug)
  if (!category) notFound()
  const all = await getCatalogProducts()
  const view = <CategoryView all={all} category={category} params={{}} />
  return (
    <Suspense fallback={view}>
      <CategoryClient slug={category.slug}>{view}</CategoryClient>
    </Suspense>
  )
}
