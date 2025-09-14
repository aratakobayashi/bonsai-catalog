import { NextRequest, NextResponse } from 'next/server'
import { saveInternalArticle, getInternalArticles } from '@/lib/cms/article-manager'

export async function GET() {
  try {
    const articles = await getInternalArticles()
    return NextResponse.json(articles)
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

    // 記事保存
    await saveInternalArticle(articleData)
    
    return NextResponse.json({ 
      message: '記事が正常に保存されました',
      slug: articleData.slug 
    })
  } catch (error) {
    console.error('記事保存エラー:', error)
    return NextResponse.json(
      { error: '記事の保存に失敗しました' }, 
      { status: 500 }
    )
  }
}