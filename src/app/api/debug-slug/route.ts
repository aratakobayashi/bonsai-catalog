import { NextResponse } from 'next/server'
import { getArticleBySlug } from '@/lib/microcms'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  if (!slug) {
    return NextResponse.json({
      success: false,
      error: 'slug parameter required'
    })
  }
  
  console.log('🔍 Testing slug:', slug)
  console.log('🔍 Encoded slug:', encodeURIComponent(slug))
  
  try {
    const article = await getArticleBySlug(slug)
    
    return NextResponse.json({
      success: true,
      slug,
      encodedSlug: encodeURIComponent(slug),
      found: !!article,
      article: article ? {
        id: article.id,
        title: article.title,
        slug: article.slug
      } : null,
      testUrl: `https://bonsai-guidebook.net/?rest_route=/wp/v2/posts&slug=${encodeURIComponent(slug)}&_embed=true`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      slug,
      encodedSlug: encodeURIComponent(slug)
    })
  }
}