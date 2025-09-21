import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

// ファイル名をサニタイズする関数
function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を除去
    .replace(/\s+/g, '-')     // スペースをハイフンに
    .replace(/-+/g, '-');     // 連続ハイフンを1つに
}

// 園の特徴に基づいてSVG画像を生成
function generateGardenSVG(garden) {
  const colors = {
    sky: '#87CEEB',
    ground: '#90EE90',
    building: '#D2B48C',
    roof: '#8B4513',
    tree1: '#228B22',
    tree2: '#32CD32',
    tree3: '#006400',
    trunk: '#8B4513',
    path: '#D2B48C'
  };

  // 地域によって色を調整
  if (garden.prefecture?.includes('北海道')) {
    colors.sky = '#B0E0E6';
    colors.ground = '#9ACD32';
  } else if (garden.prefecture?.includes('沖縄')) {
    colors.sky = '#00BFFF';
    colors.tree1 = '#32CD32';
  }

  // 専門分野によって木の配置を調整
  const specialties = garden.specialties || [];
  const isPineSpecialist = specialties.some(s => s.includes('松'));
  const isFlowerSpecialist = specialties.some(s => s.includes('花'));

  return `
<svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.sky};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.ground};stop-opacity:0.3" />
    </linearGradient>
    <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.building};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.roof};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="512" height="384" fill="url(#skyGradient)"/>

  <!-- 地面 -->
  <rect x="0" y="280" width="512" height="104" fill="${colors.ground}"/>

  <!-- 建物 -->
  <rect x="50" y="200" width="200" height="100" fill="url(#buildingGradient)"/>
  <polygon points="50,200 150,150 250,200" fill="${colors.roof}"/>

  <!-- 盆栽の木々 (専門分野に応じて配置) -->
  ${isPineSpecialist ? `
  <!-- 松系の木 -->
  <polygon points="350,250 330,220 370,220" fill="${colors.tree1}"/>
  <rect x="347" y="250" width="6" height="30" fill="${colors.trunk}"/>
  <polygon points="400,260 385,235 415,235" fill="${colors.tree1}"/>
  <rect x="397" y="260" width="6" height="25" fill="${colors.trunk}"/>
  ` : `
  <!-- 一般的な木 -->
  <circle cx="350" cy="250" r="30" fill="${colors.tree1}"/>
  <rect x="345" y="250" width="10" height="30" fill="${colors.trunk}"/>
  <circle cx="400" cy="260" r="25" fill="${colors.tree2}"/>
  <rect x="395" y="260" width="10" height="25" fill="${colors.trunk}"/>
  `}

  ${isFlowerSpecialist ? `
  <!-- 花の装飾 -->
  <circle cx="320" cy="240" r="3" fill="#FF69B4"/>
  <circle cx="325" cy="245" r="3" fill="#FFB6C1"/>
  <circle cx="380" cy="235" r="3" fill="#FF1493"/>
  <circle cx="385" cy="242" r="3" fill="#FFC0CB"/>
  ` : ''}

  <circle cx="420" cy="240" r="20" fill="${colors.tree3}"/>
  <rect x="417" y="240" width="6" height="20" fill="${colors.trunk}"/>

  <!-- 小道 -->
  <path d="M 0 320 Q 256 300 512 320" stroke="${colors.path}" stroke-width="20" fill="none"/>

  <!-- 装飾的な要素 -->
  <circle cx="100" cy="320" r="8" fill="#A0522D"/>
  <circle cx="150" cy="310" r="6" fill="#A0522D"/>
  <circle cx="200" cy="325" r="7" fill="#A0522D"/>

  <!-- タイトル背景 -->
  <rect x="10" y="10" width="${Math.min(garden.name.length * 15 + 40, 450)}" height="40" fill="rgba(255,255,255,0.9)" rx="5"/>
  <text x="20" y="35" font-family="serif" font-size="${garden.name.length > 15 ? '14' : '18'}" fill="#2F4F4F">${garden.name}</text>

  <!-- 地域表示 -->
  ${garden.prefecture ? `
  <rect x="10" y="55" width="${garden.prefecture.length * 12 + 20}" height="25" fill="rgba(255,255,255,0.8)" rx="3"/>
  <text x="15" y="72" font-family="sans-serif" font-size="12" fill="#666">${garden.prefecture}</text>
  ` : ''}
</svg>`;
}

async function generateAllGardenImagesStatic() {
  try {
    console.log('🚀 全盆栽園の静的画像生成を開始...');

    // 全盆栽園データを取得
    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, city, specialties')
      .limit(10); // まず10件で試行

    if (error) {
      console.error('❌ データ取得エラー:', error.message);
      return;
    }

    console.log(`📊 ${gardens.length}件の盆栽園の画像を生成します`);

    const results = [];
    let successCount = 0;

    // 各盆栽園の画像を生成
    for (const garden of gardens) {
      try {
        console.log(`🎨 ${garden.name}の画像生成中...`);

        // ファイル名を生成
        const fileName = sanitizeFileName(garden.name);
        const filePath = `public/images/gardens/${fileName}.svg`;

        // SVG画像を生成
        const svgContent = generateGardenSVG(garden);

        // ファイルに保存
        await fs.writeFile(filePath, svgContent, 'utf8');

        results.push({
          id: garden.id,
          name: garden.name,
          fileName: `${fileName}.svg`,
          filePath: filePath,
          success: true
        });

        successCount++;
        console.log(`✅ ${garden.name}: ${fileName}.svg`);

      } catch (error) {
        console.error(`❌ ${garden.name}の画像生成失敗:`, error.message);
        results.push({
          id: garden.id,
          name: garden.name,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`\n🎉 画像生成完了: ${successCount}/${gardens.length}件成功`);

    // コード生成の提案
    console.log('\n📋 次のステップ:');
    console.log('1. 生成された画像ファイルを確認');
    console.log('2. 盆栽園詳細ページのコードを更新');
    console.log('3. Git追加 → コミット → プッシュ');

    // 更新コードのテンプレートを生成
    console.log('\n🔧 更新が必要なコード (gardens/[id]/page.tsx):');
    console.log('```typescript');
    console.log('// 画像パスマッピング');
    console.log('const gardenImageMap: Record<string, string> = {');
    results.filter(r => r.success).forEach(r => {
      console.log(`  '${r.id}': '/images/gardens/${r.fileName}',`);
    });
    console.log('};');
    console.log('```');

    return results;

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

generateAllGardenImagesStatic();