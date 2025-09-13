import { QueryClient } from '@tanstack/react-query'

/**
 * React Query設定
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5分間はデータを新鮮として扱う
      staleTime: 5 * 60 * 1000,
      // 10分間キャッシュを保持
      gcTime: 10 * 60 * 1000,
      // エラー時の再試行設定
      retry: (failureCount, error) => {
        // 404エラーは再試行しない
        if (error instanceof Error && error.message.includes('404')) {
          return false
        }
        // 最大3回まで再試行
        return failureCount < 3
      },
      // 再試行の間隔（指数バックオフ）
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // ウィンドウフォーカス時の再フェッチを無効化
      refetchOnWindowFocus: false,
      // 再接続時の再フェッチを有効化
      refetchOnReconnect: 'always',
      // マウント時の再フェッチを無効化（SSGで既にデータがある場合）
      refetchOnMount: false,
    },
    mutations: {
      // ミューテーション失敗時は1回だけ再試行
      retry: 1,
    },
  },
})

/**
 * キャッシュキーの定数
 */
export const QUERY_KEYS = {
  // 記事関連
  articles: (params?: any) => ['articles', params] as const,
  article: (slug: string) => ['article', slug] as const,
  articleById: (id: number) => ['article', 'id', id] as const,
  popularArticles: (limit: number) => ['articles', 'popular', limit] as const,
  relatedArticles: (articleId: number, limit: number) => ['articles', 'related', articleId, limit] as const,
  
  // カテゴリー・タグ関連
  categories: () => ['categories'] as const,
  tags: () => ['tags'] as const,
  
  // 検索関連
  search: (query: string, filters?: any) => ['search', query, filters] as const,
  
  // 商品関連（将来の拡張用）
  products: (params?: any) => ['products', params] as const,
  relatedProducts: (articleSlug: string) => ['products', 'related', articleSlug] as const,
} as const

/**
 * キャッシュの手動無効化ヘルパー
 */
export const invalidateQueries = {
  // 全記事キャッシュを無効化
  allArticles: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  
  // 特定記事のキャッシュを無効化
  article: (slug: string) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.article(slug) }),
  
  // カテゴリー・タグキャッシュを無効化
  taxonomies: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags() })
  },
  
  // 検索キャッシュを無効化
  search: () => queryClient.invalidateQueries({ queryKey: ['search'] }),
}

/**
 * プリフェッチヘルパー
 */
export const prefetchQueries = {
  // 記事をプリフェッチ
  article: async (slug: string) => {
    const { getArticleBySlug } = await import('@/lib/microcms')
    return queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.article(slug),
      queryFn: () => getArticleBySlug(slug),
      staleTime: 5 * 60 * 1000,
    })
  },
  
  // カテゴリーをプリフェッチ
  categories: async () => {
    const { getCategories } = await import('@/lib/microcms')
    return queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.categories(),
      queryFn: getCategories,
      staleTime: 60 * 60 * 1000, // 1時間
    })
  },
  
  // タグをプリフェッチ
  tags: async () => {
    const { getTags } = await import('@/lib/microcms')
    return queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.tags(),
      queryFn: getTags,
      staleTime: 60 * 60 * 1000, // 1時間
    })
  },
}