'use client'

import type { ReactNode } from 'react'
import { CatalogParamGate, useUrlParams } from '@/components/static/ParamGate'
import { SoroeruView } from './SoroeruView'

// 条件付きのURLは、ブラウザで商品データを読んで描き直す
export function SoroeruClient({ children }: { children: ReactNode }) {
  const params = useUrlParams()
  if (!(Object.keys(params).length > 0)) return <>{children}</>
  return <CatalogParamGate render={(products, p) => <SoroeruView params={p} products={products} />}>{children}</CatalogParamGate>
}
