import { MetadataRoute } from 'next'

// 検索エンジンには、条件付きのURL（絞り込み・診断の答え・ページ送りなど）を巡回させない。
// 条件の組み合わせごとにサーバーでページを作るため、巡回されるとサーバーの計算時間（Vercel の無料枠）を使い切ってしまう。
// 条件なしのページ（/products・/products/category/〇〇・/kumiawase など）と、各商品・記事のページは今までどおり巡回できる
const QUERY_PATHS = [
  '/products?',
  '/products/category/*?',
  '/kumiawase?',
  '/okurimono?',
  '/shindan?',
  '/soroeru?',
  '/hajimete?',
  '/guides?*search=',
  '/guides?*sortBy=',
  '/gardens?',
  '/events?',
  '/favorites',
  '/note?',
]

// 学習用の収集ロボット（検索の表示には関係しない）は、サイト全体を巡回させない
const AI_CRAWLERS = ['GPTBot', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Bytespider', 'Amazonbot', 'meta-externalagent', 'Google-Extended', 'Applebot-Extended', 'PerplexityBot', 'Diffbot', 'ImagesiftBot', 'omgili']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /_next/ は描画に必要な JS・CSS を含むためブロックしない
        disallow: ['/api/', '/admin/', ...QUERY_PATHS],
      },
      { userAgent: AI_CRAWLERS, disallow: '/' },
    ],
    sitemap: 'https://www.bonsai-collection.com/sitemap.xml',
  }
}
