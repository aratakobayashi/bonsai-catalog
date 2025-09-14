import { NextRequest, NextResponse } from 'next/server'
import { getInternalArticleBySlug, saveInternalArticle } from '@/lib/cms/article-manager'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // IDをslugとして扱う（edit pageではarticle-1, article-2などをIDとして使用）
    const article = await getInternalArticleBySlug(id)

    if (!article) {
      return NextResponse.json(
        { error: '記事が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('記事取得エラー:', error)
    return NextResponse.json(
      { error: '記事の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const articleData = await request.json()

    // 必須フィールドのバリデーション
    if (!articleData.title || !articleData.content) {
      return NextResponse.json(
        { error: 'タイトルとコンテンツは必須です' },
        { status: 400 }
      )
    }

    // スラッグが指定されていない場合はIDを使用
    if (!articleData.slug) {
      articleData.slug = id
    }

    // 既存記事の確認
    const existingArticle = await getInternalArticleBySlug(id)
    if (!existingArticle) {
      return NextResponse.json(
        { error: '更新する記事が見つかりません' },
        { status: 404 }
      )
    }

    // 記事を更新（既存のpublishedAtを保持）
    const updatedArticle = {
      ...articleData,
      slug: id, // スラッグは変更しない
      publishedAt: existingArticle.publishedAt, // 公開日時は既存のものを保持
    }

    await saveInternalArticle(updatedArticle)

    return NextResponse.json({
      message: '記事が正常に更新されました',
      slug: id
    })
  } catch (error) {
    console.error('記事更新エラー:', error)
    return NextResponse.json(
      { error: '記事の更新に失敗しました' },
      { status: 500 }
    )
  }
}