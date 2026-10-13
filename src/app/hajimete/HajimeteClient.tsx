'use client'

import type { ReactNode } from 'react'
import { useUrlParams } from '@/components/static/ParamGate'
import { HajimeteView, type ArticleMeta } from './HajimeteView'

// 樹の種類（?shu=）を選んだときは、ブラウザで描き直す
export function HajimeteClient({ articleMeta, children }: { articleMeta: ArticleMeta; children: ReactNode }) {
  const params = useUrlParams()
  if (!params.shu) return <>{children}</>
  return <HajimeteView params={params} articleMeta={articleMeta} />
}
