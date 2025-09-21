import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 人気商品を取得（view_count順、なければランダムで上位6件）
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        image_url,
        slug,
        category,
        description
      `)
      .eq('published', true)
      .order('view_count', { ascending: false, nullsLast: true })
      .limit(6)

    if (error) {
      console.error('Error fetching popular products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch popular products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products: products || [],
      count: products?.length || 0
    })
  } catch (error) {
    console.error('Error in popular products API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}