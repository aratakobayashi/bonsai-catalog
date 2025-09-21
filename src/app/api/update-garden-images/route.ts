import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { gardenId, imageUrl } = await request.json()

    if (!gardenId || !imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Garden ID and image URL are required'
      }, { status: 400 })
    }

    // データベースの盆栽園画像を更新
    const { data, error } = await supabaseServer
      .from('gardens')
      .update({ image_url: imageUrl })
      .eq('id', gardenId)
      .select()

    if (error) {
      throw new Error(`Database update failed: ${error.message}`)
    }

    console.log('✅ 盆栽園画像更新完了:', { gardenId, imageUrl: imageUrl.substring(0, 50) + '...' })

    return NextResponse.json({
      success: true,
      data,
      message: 'Garden image updated successfully'
    })

  } catch (error) {
    console.error('❌ 盆栽園画像更新エラー:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// すべての盆栽園の画像を一括生成
export async function PUT() {
  try {
    console.log('🚀 全盆栽園の画像一括生成開始...')

    // プレースホルダー画像の盆栽園を取得
    const { data: gardens, error: fetchError } = await supabaseServer
      .from('gardens')
      .select('id, name, prefecture, city, specialties, image_url')
      .or('image_url.is.null,image_url.like.%placeholder%')

    if (fetchError) {
      throw new Error(`Failed to fetch gardens: ${fetchError.message}`)
    }

    if (!gardens || gardens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No gardens need image generation',
        processed: 0
      })
    }

    console.log(`📊 ${gardens.length}件の盆栽園の画像を生成します`)

    const results = []
    let successCount = 0
    let errorCount = 0

    // 各盆栽園の画像を生成（レート制限を考慮して順次処理）
    for (const garden of gardens) {
      try {
        console.log(`🎨 ${garden.name}の画像生成中...`)

        // 画像生成API呼び出し
        const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/generate-garden-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gardenName: garden.name,
            prefecture: garden.prefecture,
            city: garden.city,
            specialties: garden.specialties || []
          })
        })

        const generateResult = await generateResponse.json()

        if (!generateResult.success) {
          throw new Error(generateResult.error)
        }

        // データベース更新
        const { error: updateError } = await supabaseServer
          .from('gardens')
          .update({ image_url: generateResult.imageUrl })
          .eq('id', garden.id)

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`)
        }

        results.push({
          gardenId: garden.id,
          gardenName: garden.name,
          success: true,
          imageUrl: generateResult.imageUrl.substring(0, 50) + '...'
        })

        successCount++
        console.log(`✅ ${garden.name}の画像生成完了`)

        // レート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 3000))

      } catch (error) {
        console.error(`❌ ${garden.name}の画像生成失敗:`, error)
        results.push({
          gardenId: garden.id,
          gardenName: garden.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++

        // エラーの場合も少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`🎉 画像生成完了: 成功${successCount}件, 失敗${errorCount}件`)

    return NextResponse.json({
      success: true,
      message: `Image generation completed: ${successCount} successful, ${errorCount} failed`,
      processed: gardens.length,
      successCount,
      errorCount,
      results
    })

  } catch (error) {
    console.error('❌ 一括画像生成エラー:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}