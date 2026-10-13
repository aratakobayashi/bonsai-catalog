'use client'

import type { ReactNode } from 'react'
import { CatalogParamGate, useUrlParams } from '@/components/static/ParamGate'
import { ShindanView } from './ShindanView'

// 条件付きのURLは、ブラウザで商品データを読んで描き直す
export function ShindanClient({ children }: { children: ReactNode }) {
  const params = useUrlParams()
  if (!(Object.keys(params).length > 0)) return <>{children}</>
  return <CatalogParamGate render={(products, p) => <ShindanView params={p} products={products} />}>{children}</CatalogParamGate>
}
