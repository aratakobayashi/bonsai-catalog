'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { CatalogParamGate, useUrlParams } from '@/components/static/ParamGate'
import { ProductsView } from '@/components/catalog/ProductsView'

const PARTS_TITLE = '盆栽の鉢・土・道具を探す｜楽天市場の用品を価格で比較 - 盆栽コレクション'

// 条件付きの一覧（?type=parts・?max=3000 など）は、ブラウザで商品データを読んで描く
export function ProductsClient({ children }: { children: ReactNode }) {
  const params = useUrlParams()
  // 鉢・土・道具の売り場は、ページ名も売り場に合わせる
  useEffect(() => {
    if (params.type === 'parts') document.title = PARTS_TITLE
  }, [params.type])
  return <CatalogParamGate render={(products, p) => <ProductsView all={products} params={p} />}>{children}</CatalogParamGate>
}
