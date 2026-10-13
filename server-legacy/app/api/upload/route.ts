import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    // ファイルサイズチェック (10MB以下)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 })
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinaryに環境変数が設定されている場合はCloudinaryを使用
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        // ファイル名を生成（タイムスタンプ + オリジナル名）
        const timestamp = new Date().getTime()
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // 特殊文字を除去
        const publicId = `bonsai-articles/${timestamp}_${originalName.split('.')[0]}`

        // Cloudinaryにアップロード
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              public_id: publicId,
              folder: 'bonsai-articles',
              transformation: [
                { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            }
          ).end(buffer)
        }) as any

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName: originalName
        })
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError)

        // Cloudinaryエラーの場合、ローカル保存にフォールバック（開発環境のみ）
        if (process.env.NODE_ENV === 'development') {
          console.log('Cloudinaryエラー、ローカル保存にフォールバック')
        } else {
          return NextResponse.json({
            error: 'クラウドストレージへのアップロードに失敗しました。再試行してください。'
          }, { status: 500 })
        }
      }
    }

    // ローカル保存（開発環境または Cloudinary 設定なしの場合）
    if (process.env.NODE_ENV === 'development') {
      // ファイル名を生成（タイムスタンプ + オリジナル名）
      const timestamp = new Date().getTime()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // 特殊文字を除去
      const fileName = `${timestamp}_${originalName}`

      // public/images/articles ディレクトリに保存
      const uploadPath = path.join(process.cwd(), 'public', 'images', 'articles', fileName)

      try {
        await writeFile(uploadPath, buffer)

        // 公開URLを返す
        const publicUrl = `/images/articles/${fileName}`

        return NextResponse.json({
          success: true,
          url: publicUrl,
          fileName: fileName
        })
      } catch (writeError) {
        console.error('File write error:', writeError)
        return NextResponse.json({
          error: 'ファイルの保存に失敗しました。'
        }, { status: 500 })
      }
    } else {
      // 本番環境でCloudinary設定がない場合
      return NextResponse.json({
        error: '画像アップロード機能が設定されていません。管理者にお問い合わせください。'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    )
  }
}