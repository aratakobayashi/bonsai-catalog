'use client'

import type { ReactNode } from 'react'
import { CatalogParamGate, useUrlParams } from '@/components/static/ParamGate'
import { OkurimonoView, type ArticleMeta } from './OkurimonoView'

// 条件付きのURLは、ブラウザで商品データを読んで描き直す
export function OkurimonoClient({ articleMeta, children }: { articleMeta: ArticleMeta; children: ReactNode }) {
  const params = useUrlParams()
  if (!(Object.keys(params).length > 0)) return <>{children}</>
  return <CatalogParamGate render={(products, p) => <OkurimonoView params={p} products={products} articleMeta={articleMeta} />}>{children}</CatalogParamGate>
}
