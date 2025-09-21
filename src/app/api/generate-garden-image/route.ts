import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { gardenName, prefecture, city, specialties } = await request.json()

    // 盆栽園の特徴に基づいてプロンプトを生成
    const prompt = generateImagePrompt(gardenName, prefecture, city, specialties)

    console.log('🎨 画像生成開始:', { gardenName, prompt })

    // Hugging Face Stable Diffusion API呼び出し
    const imageUrl = await generateImageWithHuggingFace(prompt)

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      gardenName
    })

  } catch (error) {
    console.error('❌ 画像生成エラー:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateImagePrompt(
  gardenName: string,
  prefecture: string,
  city: string,
  specialties: string[]
): string {
  const basePrompt = "Traditional Japanese bonsai garden"

  // 地域の特徴を追加
  const locationContext = getLocationContext(prefecture)

  // 専門分野の特徴を追加
  const specialtyContext = getSpecialtyContext(specialties)

  const prompt = [
    basePrompt,
    `in ${prefecture} prefecture, Japan`,
    locationContext,
    specialtyContext,
    "peaceful zen atmosphere",
    "beautiful landscaping",
    "traditional Japanese architecture",
    "professional photography style",
    "high quality, detailed"
  ].filter(Boolean).join(', ')

  return prompt
}

function getLocationContext(prefecture: string): string {
  const contexts: Record<string, string> = {
    '埼玉県': 'suburban setting with modern Japanese aesthetics',
    '東京都': 'urban garden with compact elegant design',
    '神奈川県': 'coastal influenced design with natural elements',
    '千葉県': 'spacious layout with traditional features',
    '茨城県': 'countryside setting with natural landscape',
    '栃木県': 'mountain-influenced design with stone elements',
    '群馬県': 'highland atmosphere with fresh greenery'
  }

  return contexts[prefecture] || 'serene Japanese garden setting'
}

function getSpecialtyContext(specialties: string[]): string {
  if (!specialties || specialties.length === 0) return ''

  const contexts: Record<string, string> = {
    '松柏類': 'featuring majestic pine and conifer bonsai trees',
    '雑木類': 'with diverse deciduous bonsai varieties',
    '花もの': 'showcasing beautiful flowering bonsai',
    '実もの': 'displaying fruit-bearing bonsai trees',
    '草もの': 'with delicate grass and herb bonsai',
    'ミニ盆栽': 'featuring charming miniature bonsai displays',
    '自然樹形': 'emphasizing natural tree forms and shapes',
    '伝統技法': 'showcasing traditional bonsai techniques'
  }

  const relevantContexts = specialties
    .map(specialty => contexts[specialty])
    .filter(Boolean)

  return relevantContexts.length > 0
    ? relevantContexts.join(', ')
    : 'featuring various bonsai styles'
}

async function generateImageWithHuggingFace(prompt: string): Promise<string> {
  // 複数のモデルを試行
  const models = [
    "runwayml/stable-diffusion-v1-5",
    "stabilityai/stable-diffusion-2-1",
    "CompVis/stable-diffusion-v1-4"
  ]

  for (const model of models) {
    try {
      console.log(`🔄 Trying model: ${model}`)
      const API_URL = `https://api-inference.huggingface.co/models/${model}`

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 20,
          }
        })
      })

      if (!response.ok) {
        console.log(`❌ Model ${model} failed with status: ${response.status}`)
        continue // 次のモデルを試行
      }

      // レスポンスがバイナリ（画像）の場合
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('image')) {
        const imageBuffer = await response.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')
        console.log(`✅ Successfully generated image with ${model}`)
        return `data:image/jpeg;base64,${base64Image}`
      }

      // JSONレスポンスの場合（エラーまたは待機メッセージ）
      const result = await response.json()

      if (result.error) {
        console.log(`❌ Model ${model} error:`, result.error)
        continue // 次のモデルを試行
      }

      if (result.estimated_time) {
        console.log(`⏳ Model ${model} is loading, waiting ${result.estimated_time}s...`)
        // モデルがロード中の場合、少し待ってこのモデルでリトライ
        await new Promise(resolve => setTimeout(resolve, result.estimated_time * 1000 + 3000))

        // 再度このモデルで試行
        const retryResponse = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 20,
            }
          })
        })

        if (retryResponse.ok) {
          const retryContentType = retryResponse.headers.get('content-type')
          if (retryContentType?.includes('image')) {
            const retryImageBuffer = await retryResponse.arrayBuffer()
            const retryBase64Image = Buffer.from(retryImageBuffer).toString('base64')
            console.log(`✅ Successfully generated image with ${model} after retry`)
            return `data:image/jpeg;base64,${retryBase64Image}`
          }
        }
      }

    } catch (error) {
      console.error(`❌ Error with model ${model}:`, error)
      continue // 次のモデルを試行
    }
  }

  // すべてのモデルが失敗した場合、フォールバック画像を生成
  console.log('🎨 All AI models failed, generating fallback image...')
  return generateFallbackImage(prompt)
}

// フォールバック：CSS/SVGベースの画像生成
function generateFallbackImage(prompt: string): string {
  // SVGで美しい盆栽園イメージを生成
  const svg = `
    <svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#98FB98;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#D2B48C;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B4513;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- 背景 -->
      <rect width="512" height="384" fill="url(#skyGradient)"/>

      <!-- 地面 -->
      <rect x="0" y="280" width="512" height="104" fill="#90EE90"/>

      <!-- 建物 -->
      <rect x="50" y="200" width="200" height="100" fill="url(#buildingGradient)"/>
      <polygon points="50,200 150,150 250,200" fill="#8B4513"/>

      <!-- 盆栽の木々 -->
      <circle cx="350" cy="250" r="30" fill="#228B22"/>
      <rect x="345" y="250" width="10" height="30" fill="#8B4513"/>

      <circle cx="400" cy="260" r="25" fill="#32CD32"/>
      <rect x="395" y="260" width="10" height="25" fill="#8B4513"/>

      <circle cx="420" cy="240" r="20" fill="#228B22"/>
      <rect x="417" y="240" width="6" height="20" fill="#8B4513"/>

      <!-- 小道 -->
      <path d="M 0 320 Q 256 300 512 320" stroke="#D2B48C" stroke-width="20" fill="none"/>

      <!-- 装飾的な要素 -->
      <circle cx="100" cy="320" r="8" fill="#A0522D"/>
      <circle cx="150" cy="310" r="6" fill="#A0522D"/>
      <circle cx="200" cy="325" r="7" fill="#A0522D"/>

      <!-- タイトル背景 -->
      <rect x="10" y="10" width="300" height="40" fill="rgba(255,255,255,0.8)" rx="5"/>
      <text x="20" y="35" font-family="serif" font-size="24" fill="#2F4F4F">Traditional Bonsai Garden</text>
    </svg>
  `

  // SVGをBase64エンコード
  const base64Svg = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64Svg}`
}