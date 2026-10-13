'use client'

import type { ReactNode } from 'react'
import { CatalogParamGate } from '@/components/static/ParamGate'
import { getShopCategory } from '@/lib/shop-categories'
import { CategoryView } from './CategoryView'

// 条件付きの一覧は、ブラウザで商品データを読んで描く
export function CategoryClient({ slug, children }: { slug: string; children: ReactNode }) {
  const category = getShopCategory(slug)
  if (!category) return <>{children}</>
  return <CatalogParamGate render={(products, params) => <CategoryView all={products} category={category} params={params} />}>{children}</CatalogParamGate>
}
