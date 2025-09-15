import { NextRequest, NextResponse } from 'next/server'
import { getArticleBySlug, updateArticle, deleteArticle } from '@/lib/database/articles'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // IDをslugとして扱う（edit pageではarticle-1, article-2などをIDとして使用）
    const article = await getArticleBySlug(id)

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

    // 既存記事の確認
    const existingArticle = await getArticleBySlug(id)
    if (!existingArticle) {
      return NextResponse.json(
        { error: '更新する記事が見つかりません' },
        { status: 404 }
      )
    }

    // 記事を更新（IDとslugは変更しない）
    const updatedArticle = await updateArticle(existingArticle.id, {
      ...articleData,
      slug: id, // スラッグは変更しない
    })

    if (!updatedArticle) {
      return NextResponse.json(
        { error: '記事の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '記事が正常に更新されました',
      article: updatedArticle
    })
  } catch (error) {
    console.error('記事更新エラー:', error)
    return NextResponse.json(
      { error: '記事の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // 既存記事の確認
    const existingArticle = await getArticleBySlug(id)
    if (!existingArticle) {
      return NextResponse.json(
        { error: '削除する記事が見つかりません' },
        { status: 404 }
      )
    }

    // 記事を削除
    const success = await deleteArticle(existingArticle.id)

    if (!success) {
      return NextResponse.json(
        { error: '記事の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '記事が正常に削除されました'
    })
  } catch (error) {
    console.error('記事削除エラー:', error)
    return NextResponse.json(
      { error: '記事の削除に失敗しました' },
      { status: 500 }
    )
  }
}