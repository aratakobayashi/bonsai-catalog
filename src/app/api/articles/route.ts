import { NextRequest, NextResponse } from 'next/server'
import { getArticles, createArticle } from '@/lib/database/articles'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const result = await getArticles({
      page,
      limit,
      category,
      search,
      sortBy: 'published_at',
      sortOrder: 'desc'
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('記事取得エラー:', error)
    return NextResponse.json(
      { error: '記事の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const articleData = await request.json()

    // 必須フィールドのバリデーション
    if (!articleData.title || !articleData.slug || !articleData.content) {
      return NextResponse.json(
        { error: 'タイトル、スラッグ、コンテンツは必須です' },
        { status: 400 }
      )
    }

    // カテゴリーIDの確認（デフォルトは「その他」）
    if (!articleData.category?.id) {
      articleData.category = { id: '11111111-1111-1111-1111-111111111111' } // お手入れ・管理
    }

    // 記事作成
    const newArticle = await createArticle(articleData)

    return NextResponse.json({
      message: '記事が正常に保存されました',
      article: newArticle
    })
  } catch (error) {
    console.error('記事保存エラー:', error)
    return NextResponse.json(
      { error: '記事の保存に失敗しました' },
      { status: 500 }
    )
  }
}