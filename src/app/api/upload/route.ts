import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 })
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 })
    }

    // 本番環境ではCloudinaryを使用（環境変数設定が必要）
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        error: '本番環境では画像アップロードを一時的に無効にしています。開発環境をご利用ください。'
      }, { status: 503 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ファイル名を生成（タイムスタンプ + オリジナル名）
    const timestamp = new Date().getTime()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // 特殊文字を除去
    const fileName = `${timestamp}_${originalName}`

    // public/images/articles ディレクトリに保存（開発環境のみ）
    const uploadPath = path.join(process.cwd(), 'public', 'images', 'articles', fileName)

    try {
      await writeFile(uploadPath, buffer)
    } catch (writeError) {
      console.error('File write error:', writeError)
      return NextResponse.json({
        error: 'ファイルの保存に失敗しました。開発環境でお試しください。'
      }, { status: 500 })
    }

    // 公開URLを返す
    const publicUrl = `/images/articles/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    )
  }
}