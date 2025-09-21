import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('id, name, image_url, description')
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const typedGardens = gardens as Array<{
      id: string
      name: string
      image_url: string | null
      description: string | null
    }> | null

    const summary = {
      total: typedGardens?.length || 0,
      withImage: typedGardens?.filter(g => g.image_url).length || 0,
      withoutImage: typedGardens?.filter(g => !g.image_url).length || 0,
      gardens: typedGardens?.map(g => ({
        name: g.name,
        hasImage: !!g.image_url,
        hasDescription: !!g.description
      }))
    }

    return NextResponse.json(summary)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch gardens' }, { status: 500 })
  }
}