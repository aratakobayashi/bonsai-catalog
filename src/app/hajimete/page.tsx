import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import { KINDS } from '@/lib/hajimete'
import { HajimeteView, type ArticleMeta } from './HajimeteView'
import { HajimeteClient } from './HajimeteClient'

export const metadata: Metadata = {
  title: 'はじめての1か月ガイド｜盆栽が届いた日から1か月の世話をチェックリストで - 盆栽コレクション',
  description: '盆栽が届いた日、1〜3日目、1週目、2週目、3〜4週目にやることをチェックリストにまとめました。樹の種類（松柏類・雑木類・花もの・実もの・さつき・室内向き）を選ぶと、置き場所と水やりの助言も合わせて表示します。チェックは保存できます。',
  alternates: { canonical: '/hajimete' },
}

// 樹の種類ごとに案内する記事と、どの種類でも出す記事
const DEFAULT_ARTICLES = ['article-11', 'bonsai-online-sales-complete-guide', 'bonsai-watering-master-guide-2025', 'article-12']

export default function HajimetePage() {
  const slugs = Array.from(new Set([...KINDS.flatMap(kind => kind.articles ?? []), ...DEFAULT_ARTICLES]))
  const articleMeta: ArticleMeta = Object.fromEntries(slugs.map(slug => [slug, { title: getArticleOverride(slug)?.title ?? '', image: thumbnailPath(slug) ?? null }]))
  const view = <HajimeteView params={{}} articleMeta={articleMeta} />
  return (
    <Suspense fallback={view}>
      <HajimeteClient articleMeta={articleMeta}>{view}</HajimeteClient>
    </Suspense>
  )
}
