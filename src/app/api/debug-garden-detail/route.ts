import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Garden ID is required' }, { status: 400 })
    }

    const { data: garden, error } = await supabaseServer
      .from('gardens')
      .select('id, name, image_url')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      garden,
      imageUrlLength: garden?.image_url?.length || 0,
      imageUrlStart: garden?.image_url?.substring(0, 100) || 'No image URL',
      hasImageUrl: !!garden?.image_url
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch garden details' }, { status: 500 })
  }
}