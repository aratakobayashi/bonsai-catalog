import { NextRequest, NextResponse } from 'next/server'
import { getEventBySlug } from '@/lib/events'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // lib/events.tsの関数を使用
    const result = await getEventBySlug(slug)

    if (!result) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // JSON返却（日本語対応）
    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Event detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}