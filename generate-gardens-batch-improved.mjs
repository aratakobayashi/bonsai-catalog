import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

// 改良されたファイル名サニタイズ関数
function sanitizeFileName(name, id) {
  // 日本語をローマ字に変換する簡易版
  const romajiMap = {
    '九霞園': 'kyukaen',
    '藤樹園': 'tojuen',
    '清香園': 'seikaen',
    '蔓青園': 'manseien',
    '芙蓉園': 'fuyoen',
    '春花園': 'shunkaen',
    '高松盆栽の郷': 'takamatsu-bonsai-no-sato',
    '中西珍松園': 'nakanishi-chinshoen',
    '鬼無植木盆栽センター': 'kinashi-ueki-bonsai-center',
    '盆栽の匠': 'bonsai-no-takumi'
  };

  // 既知の名前の場合はローマ字を使用
  if (romajiMap[name]) {
    return romajiMap[name];
  }

  // 英数字を抽出してクリーンアップ
  let cleaned = name
    .replace(/[^\w\s\-]/g, '') // 特殊文字を除去
    .replace(/\s+/g, '-')      // スペースをハイフンに
    .replace(/-+/g, '-')       // 連続ハイフンを1つに
    .toLowerCase();

  // 空の場合はIDベースのファイル名
  if (!cleaned || cleaned === '' || cleaned === '-') {
    cleaned = `garden-${id.slice(0, 8)}`;
  }

  return cleaned;
}

// 園の特徴に基づいてSVG画像を生成（改良版）
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

  // 地域による色調整
  if (garden.prefecture?.includes('北海道')) {
    colors.sky = '#B0E0E6';
    colors.ground = '#9ACD32';
  } else if (garden.prefecture?.includes('沖縄')) {
    colors.sky = '#00BFFF';
    colors.tree1 = '#32CD32';
  } else if (garden.prefecture?.includes('九州')) {
    colors.sky = '#87CEFA';
    colors.tree2 = '#228B22';
  }

  // 専門分野によるカスタマイズ
  const specialties = garden.specialties || [];
  const isPineSpecialist = specialties.some(s => s.includes('松'));
  const isFlowerSpecialist = specialties.some(s => s.includes('花'));
  const isMiniSpecialist = specialties.some(s => s.includes('ミニ'));

  return `<svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
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

  <!-- メイン建物 -->
  <rect x="50" y="200" width="200" height="100" fill="url(#buildingGradient)"/>
  <polygon points="50,200 150,150 250,200" fill="${colors.roof}"/>

  <!-- 盆栽の木々 -->
  ${isPineSpecialist ? `
  <!-- 松専門園 - 三角形の松 -->
  <polygon points="350,250 330,220 370,220" fill="${colors.tree1}"/>
  <rect x="347" y="250" width="6" height="30" fill="${colors.trunk}"/>
  <polygon points="400,260 385,235 415,235" fill="${colors.tree1}"/>
  <rect x="397" y="260" width="6" height="25" fill="${colors.trunk}"/>
  <polygon points="420,240 410,215 430,215" fill="${colors.tree3}"/>
  <rect x="417" y="240" width="6" height="20" fill="${colors.trunk}"/>
  ` : `
  <!-- 一般的な盆栽 -->
  <circle cx="350" cy="250" r="30" fill="${colors.tree1}"/>
  <rect x="345" y="250" width="10" height="30" fill="${colors.trunk}"/>
  <circle cx="400" cy="260" r="25" fill="${colors.tree2}"/>
  <rect x="395" y="260" width="10" height="25" fill="${colors.trunk}"/>
  <circle cx="420" cy="240" r="20" fill="${colors.tree3}"/>
  <rect x="417" y="240" width="6" height="20" fill="${colors.trunk}"/>
  `}

  ${isFlowerSpecialist ? `
  <!-- 花専門園 - 花の装飾 -->
  <circle cx="320" cy="240" r="4" fill="#FF69B4"/>
  <circle cx="325" cy="245" r="3" fill="#FFB6C1"/>
  <circle cx="315" cy="245" r="3" fill="#FF1493"/>
  <circle cx="380" cy="235" r="4" fill="#FF69B4"/>
  <circle cx="385" cy="242" r="3" fill="#FFC0CB"/>
  <circle cx="375" cy="242" r="3" fill="#FF1493"/>
  ` : ''}

  ${isMiniSpecialist ? `
  <!-- ミニ盆栽専門 - 小さな盆栽群 -->
  <circle cx="300" cy="270" r="8" fill="${colors.tree1}"/>
  <rect x="298" y="270" width="4" height="10" fill="${colors.trunk}"/>
  <circle cx="320" cy="275" r="6" fill="${colors.tree2}"/>
  <rect x="318" y="275" width="4" height="8" fill="${colors.trunk}"/>
  <circle cx="340" cy="272" r="7" fill="${colors.tree3}"/>
  <rect x="338" y="272" width="4" height="9" fill="${colors.trunk}"/>
  ` : ''}

  <!-- 小道 -->
  <path d="M 0 320 Q 256 300 512 320" stroke="${colors.path}" stroke-width="20" fill="none"/>

  <!-- 装飾石 -->
  <circle cx="100" cy="320" r="8" fill="#A0522D"/>
  <circle cx="150" cy="310" r="6" fill="#A0522D"/>
  <circle cx="200" cy="325" r="7" fill="#A0522D"/>

  <!-- タイトル背景 -->
  <rect x="10" y="10" width="${Math.min(garden.name.length * 16 + 40, 480)}" height="40" fill="rgba(255,255,255,0.9)" rx="5"/>
  <text x="20" y="35" font-family="serif" font-size="${garden.name.length > 15 ? '14' : garden.name.length > 10 ? '16' : '18'}" fill="#2F4F4F">${garden.name}</text>

  <!-- 地域表示 -->
  ${garden.prefecture ? `
  <rect x="10" y="55" width="${garden.prefecture.length * 12 + 20}" height="25" fill="rgba(255,255,255,0.8)" rx="3"/>
  <text x="15" y="72" font-family="sans-serif" font-size="12" fill="#666">${garden.prefecture}</text>
  ` : ''}

  <!-- 専門分野アイコン -->
  ${specialties.length > 0 ? `
  <rect x="400" y="10" width="100" height="60" fill="rgba(255,255,255,0.8)" rx="3"/>
  <text x="405" y="25" font-family="sans-serif" font-size="10" fill="#666">専門分野</text>
  <text x="405" y="40" font-family="sans-serif" font-size="9" fill="#333">${specialties.slice(0, 2).join('・')}</text>
  ${specialties.length > 2 ? `<text x="405" y="55" font-family="sans-serif" font-size="9" fill="#333">他${specialties.length - 2}分野</text>` : ''}
  ` : ''}
</svg>`;
}

async function generateGardensBatchImproved() {
  try {
    console.log('🚀 改良版: 盆栽園画像一括生成開始...');

    // まず5件で試行
    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, city, specialties')
      .limit(5);

    if (error) {
      console.error('❌ データ取得エラー:', error.message);
      return;
    }

    console.log(`📊 ${gardens.length}件の盆栽園画像を生成します\n`);

    const results = [];
    const codeMap = [];

    for (const garden of gardens) {
      try {
        console.log(`🎨 ${garden.name} (${garden.prefecture || '場所不明'})`);

        // 改良されたファイル名生成
        const fileName = sanitizeFileName(garden.name, garden.id);
        const filePath = `public/images/gardens/${fileName}.svg`;

        console.log(`   → ファイル名: ${fileName}.svg`);

        // SVG画像生成
        const svgContent = generateGardenSVG(garden);

        // ファイル保存
        await fs.writeFile(filePath, svgContent, 'utf8');

        results.push({
          id: garden.id,
          name: garden.name,
          fileName: `${fileName}.svg`,
          success: true
        });

        codeMap.push(`  '${garden.id}': '/images/gardens/${fileName}.svg',`);

        console.log(`   ✅ 生成完了\n`);

      } catch (error) {
        console.error(`   ❌ 失敗: ${error.message}\n`);
      }
    }

    console.log('🎉 画像生成完了！');
    console.log('\n📋 コード更新用マッピング:');
    console.log('const gardenImageMap: Record<string, string> = {');
    console.log("  '3000a4b6-0a10-4896-9ff2-b3a9d09c14db': '/images/gardens/kawaguchi-ryokuka-center-jurian.svg', // 川口緑化センター");
    codeMap.forEach(line => console.log(line));
    console.log('};');

    return results;

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

generateGardensBatchImproved();