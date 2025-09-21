import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

// プレミアム盆栽園の特別なファイル名マッピング
const premiumGardenNames = {
  '中西珍松園': 'nakanishi-chinshoen',
  '春花園BONSAI美術館': 'shunkaen-bonsai-museum',
  '京都盆栽会館': 'kyoto-bonsai-kaikan',
  '陽春園': 'yoshunen',
  '鎌倉盆栽苑': 'kamakura-bonsai-en',
  '武蔵野盆栽園': 'musashino-bonsai-en',
  '関西盆栽センター': 'kansai-bonsai-center',
  '沖縄盆栽園': 'okinawa-bonsai-en',
  '京都伝統庭園センター': 'kyoto-traditional-garden-center',
  '浅草盆栽工房': 'asakusa-bonsai-koubou'
};

function getPremiumFileName(name, id) {
  return premiumGardenNames[name] || `premium-garden-${id.slice(0, 8)}`;
}

// プレミアム園の特別SVG生成（より詳細で美しく）
function generatePremiumGardenSVG(garden) {
  const colors = {
    sky: '#87CEEB',
    ground: '#90EE90',
    building: '#D2B48C',
    roof: '#8B4513',
    tree1: '#228B22',
    tree2: '#32CD32',
    tree3: '#006400',
    trunk: '#8B4513',
    path: '#D2B48C',
    accent: '#FF6B6B'
  };

  // 地域・文化による特別カスタマイズ
  if (garden.name.includes('京都')) {
    colors.building = '#8B4513'; // 木造建築風
    colors.roof = '#654321';
    colors.accent = '#DC143C'; // 朱色
  } else if (garden.name.includes('鎌倉')) {
    colors.sky = '#98D8E8';
    colors.building = '#DEB887';
    colors.accent = '#4169E1'; // 古都の青
  } else if (garden.name.includes('沖縄')) {
    colors.sky = '#00BFFF';
    colors.ground = '#32CD32';
    colors.tree1 = '#228B22';
    colors.accent = '#FF4500'; // 南国オレンジ
  } else if (garden.name.includes('浅草')) {
    colors.building = '#CD853F';
    colors.roof = '#8B4513';
    colors.accent = '#B22222'; // 江戸の赤
  }

  // 専門分野による高級感演出
  const specialties = garden.specialties || [];
  const isMuseum = garden.name.includes('美術館') || garden.name.includes('会館');
  const isPineSpecialist = specialties.some(s => s.includes('松'));
  const isTraditional = specialties.some(s => s.includes('伝統'));

  return `<svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.sky};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.ground};stop-opacity:0.2" />
    </linearGradient>
    <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.building};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.roof};stop-opacity:1" />
    </linearGradient>
    <radialGradient id="treeGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${colors.tree2};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.tree1};stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- 背景 -->
  <rect width="512" height="384" fill="url(#skyGradient)"/>

  <!-- 地面レイヤー -->
  <rect x="0" y="280" width="512" height="104" fill="${colors.ground}"/>

  ${isMuseum ? `
  <!-- 美術館・会館スタイル -->
  <rect x="40" y="180" width="240" height="120" fill="url(#buildingGradient)"/>
  <rect x="50" y="190" width="220" height="10" fill="${colors.accent}"/>
  <polygon points="40,180 160,140 280,180" fill="${colors.roof}"/>
  <!-- 美術館の看板 -->
  <rect x="300" y="190" width="80" height="40" fill="rgba(255,255,255,0.9)" rx="3"/>
  <text x="305" y="205" font-family="serif" font-size="8" fill="#333">BONSAI</text>
  <text x="305" y="220" font-family="serif" font-size="8" fill="#333">MUSEUM</text>
  ` : `
  <!-- 一般的な園芸センター -->
  <rect x="50" y="200" width="200" height="100" fill="url(#buildingGradient)"/>
  <polygon points="50,200 150,150 250,200" fill="${colors.roof}"/>
  `}

  <!-- プレミアム盆栽展示 -->
  ${isPineSpecialist ? `
  <!-- 松専門園 - 格調高い松 -->
  <polygon points="340,250 315,200 365,200" fill="${colors.tree1}"/>
  <polygon points="340,230 325,190 355,190" fill="${colors.tree2}"/>
  <rect x="337" y="250" width="6" height="30" fill="${colors.trunk}"/>

  <polygon points="380,260 360,210 400,210" fill="${colors.tree1}"/>
  <polygon points="380,240 365,195 395,195" fill="${colors.tree2}"/>
  <rect x="377" y="260" width="6" height="25" fill="${colors.trunk}"/>

  <polygon points="420,240 405,195 435,195" fill="${colors.tree1}"/>
  <rect x="417" y="240" width="6" height="20" fill="${colors.trunk}"/>
  ` : `
  <!-- 多様な盆栽コレクション -->
  <circle cx="340" cy="250" r="35" fill="url(#treeGradient)"/>
  <rect x="335" y="250" width="10" height="30" fill="${colors.trunk}"/>

  <circle cx="390" cy="260" r="30" fill="url(#treeGradient)"/>
  <rect x="385" y="260" width="10" height="25" fill="${colors.trunk}"/>

  <circle cx="430" cy="240" r="25" fill="url(#treeGradient)"/>
  <rect x="425" y="240" width="8" height="20" fill="${colors.trunk}"/>
  `}

  ${isTraditional ? `
  <!-- 伝統技法の装飾 -->
  <rect x="460" y="200" width="40" height="60" fill="rgba(139,69,19,0.3)" rx="5"/>
  <text x="465" y="220" font-family="serif" font-size="8" fill="#654321">伝統</text>
  <text x="465" y="235" font-family="serif" font-size="8" fill="#654321">技法</text>
  ` : ''}

  <!-- 高級感のある石庭風装飾 -->
  <ellipse cx="120" cy="320" rx="15" ry="8" fill="#A0522D"/>
  <ellipse cx="180" cy="315" rx="12" ry="6" fill="#A0522D"/>
  <ellipse cx="240" cy="325" rx="18" ry="9" fill="#A0522D"/>

  <!-- プレミアム小道 -->
  <path d="M 0 320 Q 128 300 256 320 Q 384 340 512 320" stroke="${colors.path}" stroke-width="25" fill="none"/>
  <path d="M 0 318 Q 128 298 256 318 Q 384 338 512 318" stroke="#E6D3A3" stroke-width="5" fill="none"/>

  <!-- 評価星（4.6以上の園のみ）-->
  ${garden.rating >= 4.6 ? `
  <g transform="translate(450, 20)">
    <circle cx="15" cy="15" r="12" fill="rgba(255,215,0,0.8)"/>
    <polygon points="15,8 17,13 22,13 18,16 20,21 15,18 10,21 12,16 8,13 13,13" fill="#FFD700"/>
    <text x="15" y="35" font-family="sans-serif" font-size="8" fill="#333" text-anchor="middle">${garden.rating}</text>
  </g>
  ` : ''}

  <!-- メインタイトル -->
  <rect x="10" y="10" width="${Math.min(garden.name.length * 16 + 50, 430)}" height="45" fill="rgba(255,255,255,0.95)" rx="8" stroke="${colors.accent}" stroke-width="2"/>
  <text x="20" y="35" font-family="serif" font-size="${garden.name.length > 12 ? '14' : '18'}" fill="#2F4F4F" font-weight="bold">${garden.name}</text>

  <!-- 地域・設立年情報 -->
  ${garden.prefecture || garden.established_year ? `
  <rect x="10" y="60" width="${Math.max((garden.prefecture?.length || 0) * 12, (garden.established_year ? 80 : 0)) + 30}" height="30" fill="rgba(255,255,255,0.9)" rx="5"/>
  <text x="15" y="75" font-family="sans-serif" font-size="11" fill="#666">${garden.prefecture || ''}</text>
  ${garden.established_year ? `<text x="15" y="87" font-family="sans-serif" font-size="9" fill="#888">創業${garden.established_year}年</text>` : ''}
  ` : ''}

  <!-- 専門分野表示 -->
  ${specialties.length > 0 ? `
  <rect x="350" y="60" width="150" height="70" fill="rgba(255,255,255,0.9)" rx="5"/>
  <text x="355" y="75" font-family="sans-serif" font-size="9" fill="#666" font-weight="bold">専門分野</text>
  ${specialties.slice(0, 3).map((specialty, i) =>
    `<text x="355" y="${90 + i * 12}" font-family="sans-serif" font-size="8" fill="#333">• ${specialty}</text>`
  ).join('')}
  ` : ''}

  ${garden.featured ? `
  <!-- 注目園バッジ -->
  <rect x="15" y="100" width="60" height="20" fill="${colors.accent}" rx="10"/>
  <text x="45" y="113" font-family="sans-serif" font-size="10" fill="white" text-anchor="middle" font-weight="bold">注目園</text>
  ` : ''}
</svg>`;
}

async function generatePremiumGardens() {
  try {
    console.log('🏆 プレミアム盆栽園の画像生成開始...\n');

    // 選定した10園のIDリスト
    const premiumGardenIds = [
      'a23957ee-4154-4d59-9bb8-f18ee1c8ca26', // 中西珍松園
      '20702388-f8b8-408e-8d6e-dd158031b048', // 春花園BONSAI美術館
      'f61bc0fe-53e8-4ec3-a3a8-29bfff2c0870', // 京都盆栽会館
      'f0f86407-1a4b-4100-987c-2743b441fcee', // 陽春園
      '5266402a-5bda-4a5b-bfbd-eaf58e8d9f99', // 鎌倉盆栽苑
      '34ba6634-3e68-4ed6-a766-07ac2d3aba33', // 武蔵野盆栽園
      '1cdef4ba-d729-47c4-be31-86c879ea0aa2', // 関西盆栽センター
      '5e7de278-e355-42be-943d-3e877f04bfcf', // 沖縄盆栽園
      'b5305c48-7ebe-4486-8391-622f282ebfbc', // 京都伝統庭園センター
      'cfd47538-d3b2-4c33-869a-68652c2d0563'  // 浅草盆栽工房
    ];

    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, city, specialties, rating, featured, established_year')
      .in('id', premiumGardenIds);

    if (error) {
      console.error('❌ データ取得エラー:', error.message);
      return;
    }

    console.log(`📊 ${gardens.length}件のプレミアム盆栽園画像を生成します\n`);

    const results = [];
    const codeMap = [];

    for (const garden of gardens) {
      try {
        const rating = garden.rating || '未評価';
        const featured = garden.featured ? '⭐注目' : '';
        console.log(`🎨 ${garden.name} ${featured}`);
        console.log(`   📍 ${garden.prefecture} | ⭐ ${rating}`);

        const fileName = getPremiumFileName(garden.name, garden.id);
        const filePath = `public/images/gardens/${fileName}.svg`;

        console.log(`   → ファイル: ${fileName}.svg`);

        // プレミアムSVG生成
        const svgContent = generatePremiumGardenSVG(garden);
        await fs.writeFile(filePath, svgContent, 'utf8');

        results.push({
          id: garden.id,
          name: garden.name,
          fileName: `${fileName}.svg`,
          success: true
        });

        codeMap.push(`  '${garden.id}': '/images/gardens/${fileName}.svg', // ${garden.name}`);

        console.log(`   ✅ 生成完了\n`);

      } catch (error) {
        console.error(`   ❌ 失敗: ${error.message}\n`);
      }
    }

    console.log('🎉 プレミアム園画像生成完了！');
    console.log(`✅ 成功: ${results.filter(r => r.success).length}/${gardens.length}件\n`);

    console.log('📋 更新用コードマッピング:');
    console.log('// 既存マッピングに追加');
    codeMap.forEach(line => console.log(line));

    return results;

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

generatePremiumGardens();