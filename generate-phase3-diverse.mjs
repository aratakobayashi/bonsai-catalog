import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

// フェーズ3の多様な園の特別ファイル名マッピング
const phase3GardenNames = {
  '大和魂盆栽': 'yamato-damashii-bonsai',
  'ガーデニングサロン 風の散歩道': 'kaze-no-sanpomichi-salon',
  'SOLSO FARM': 'solso-farm',
  '養庄園': 'yoshoen',
  'まつおえんげい': 'matsuo-engei',
  'さぬき盆栽の郷': 'sanuki-bonsai-no-sato',
  '神戸盆栽館': 'kobe-bonsai-kan',
  '盆栽四季の杜': 'bonsai-shiki-no-mori',
  '松江盆栽センター': 'matsue-bonsai-center',
  '見元園芸': 'mimoto-engei'
};

function getPhase3FileName(name, id) {
  return phase3GardenNames[name] || `diverse-garden-${id.slice(0, 8)}`;
}

// 地域・専門分野に特化したSVG生成（フェーズ3版）
function generateDiverseGardenSVG(garden) {
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

  // 地域による特別カスタマイズ
  if (garden.prefecture === '島根県') {
    colors.sky = '#B0C4DE'; // 出雲の空
    colors.accent = '#4682B4';
  } else if (garden.prefecture === '高知県') {
    colors.sky = '#00CED1'; // 太平洋の青
    colors.ground = '#32CD32';
    colors.accent = '#FF4500';
  } else if (garden.prefecture === '大分県') {
    colors.sky = '#87CEFA'; // 九州の空
    colors.accent = '#FF69B4';
  } else if (garden.prefecture === '香川県') {
    colors.sky = '#98D8E8'; // 瀬戸内の空
    colors.accent = '#FFD700';
  }

  // 専門分野による特殊レイアウト
  const specialties = garden.specialties || [];
  const isRoseSpecialist = specialties.some(s => s.includes('バラ'));
  const isViolaSpecialist = specialties.some(s => s.includes('ビオラ'));
  const isStylish = garden.name.includes('SOLSO') || specialties.some(s => s.includes('スタイリッシュ'));
  const isPotSpecialist = specialties.some(s => s.includes('鉢'));
  const isEducational = specialties.some(s => s.includes('教室'));

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
    <radialGradient id="flowerGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF69B4;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- 背景 -->
  <rect width="512" height="384" fill="url(#skyGradient)"/>

  <!-- 地面 -->
  <rect x="0" y="280" width="512" height="104" fill="${colors.ground}"/>

  ${isStylish ? `
  <!-- スタイリッシュ・モダン建築 -->
  <rect x="40" y="180" width="220" height="120" fill="#F5F5F5" stroke="${colors.accent}" stroke-width="2"/>
  <rect x="50" y="190" width="200" height="8" fill="${colors.accent}"/>
  <rect x="270" y="180" width="80" height="120" fill="#E0E0E0"/>
  <!-- ガラス窓 -->
  <rect x="60" y="210" width="40" height="60" fill="#B0E0E6" opacity="0.7"/>
  <rect x="120" y="210" width="40" height="60" fill="#B0E0E6" opacity="0.7"/>
  <rect x="180" y="210" width="40" height="60" fill="#B0E0E6" opacity="0.7"/>
  ` : `
  <!-- 伝統的な建物 -->
  <rect x="50" y="200" width="200" height="100" fill="url(#buildingGradient)"/>
  <polygon points="50,200 150,150 250,200" fill="${colors.roof}"/>
  `}

  <!-- 専門分野による特別展示 -->
  ${isRoseSpecialist ? `
  <!-- バラ専門園 - 美しいバラ園 -->
  <circle cx="330" cy="240" r="12" fill="url(#flowerGradient)"/>
  <circle cx="350" cy="250" r="15" fill="url(#flowerGradient)"/>
  <circle cx="370" cy="235" r="10" fill="url(#flowerGradient)"/>
  <circle cx="390" cy="245" r="13" fill="url(#flowerGradient)"/>
  <circle cx="410" cy="255" r="11" fill="url(#flowerGradient)"/>
  <circle cx="430" cy="240" r="14" fill="url(#flowerGradient)"/>
  <!-- バラのトレリス -->
  <rect x="320" y="260" width="120" height="3" fill="#8B4513"/>
  <rect x="340" y="245" width="3" height="25" fill="#8B4513"/>
  <rect x="380" y="245" width="3" height="25" fill="#8B4513"/>
  <rect x="420" y="245" width="3" height="25" fill="#8B4513"/>
  ` : isViolaSpecialist ? `
  <!-- ビオラ専門園 - カラフルな花畑 -->
  <circle cx="330" cy="270" r="5" fill="#9370DB"/>
  <circle cx="340" cy="275" r="4" fill="#4169E1"/>
  <circle cx="350" cy="265" r="5" fill="#FFD700"/>
  <circle cx="360" cy="270" r="4" fill="#FF69B4"/>
  <circle cx="370" cy="275" r="5" fill="#32CD32"/>
  <circle cx="380" cy="265" r="4" fill="#FF4500"/>
  <circle cx="390" cy="270" r="5" fill="#8A2BE2"/>
  <circle cx="400" cy="275" r="4" fill="#00CED1"/>
  <circle cx="410" cy="265" r="5" fill="#FF1493"/>
  <circle cx="420" cy="270" r="4" fill="#32CD32"/>
  ` : isPotSpecialist ? `
  <!-- 高級盆栽鉢専門 - 美しい鉢の展示 -->
  <rect x="330" y="260" width="20" height="15" fill="#8B4513" rx="2"/>
  <rect x="360" y="255" width="25" height="20" fill="#A0522D" rx="3"/>
  <rect x="395" y="250" width="30" height="25" fill="#D2691E" rx="4"/>
  <rect x="435" y="245" width="22" height="18" fill="#CD853F" rx="2"/>
  <!-- 鉢の装飾 -->
  <circle cx="340" cy="252" r="1" fill="#FFD700"/>
  <circle cx="372" cy="245" r="1" fill="#FFD700"/>
  <circle cx="410" cy="237" r="1" fill="#FFD700"/>
  ` : `
  <!-- 一般的な盆栽展示 -->
  <circle cx="340" cy="250" r="30" fill="${colors.tree1}"/>
  <rect x="335" y="250" width="10" height="30" fill="${colors.trunk}"/>
  <circle cx="390" cy="260" r="25" fill="${colors.tree2}"/>
  <rect x="385" y="260" width="10" height="25" fill="${colors.trunk}"/>
  <circle cx="430" cy="240" r="20" fill="${colors.tree3}"/>
  <rect x="425" y="240" width="8" height="20" fill="${colors.trunk}"/>
  `}

  ${isEducational ? `
  <!-- 教育施設の看板 -->
  <rect x="460" y="180" width="45" height="50" fill="rgba(255,255,255,0.9)" rx="5" stroke="${colors.accent}" stroke-width="2"/>
  <text x="465" y="195" font-family="sans-serif" font-size="8" fill="#333">教室</text>
  <text x="465" y="208" font-family="sans-serif" font-size="8" fill="#333">開催中</text>
  <circle cx="482" cy="220" r="8" fill="${colors.accent}" opacity="0.8"/>
  <text x="482" y="225" font-family="sans-serif" font-size="6" fill="white" text-anchor="middle">👨‍🏫</text>
  ` : ''}

  <!-- 地域特色の装飾 -->
  ${garden.prefecture === '島根県' ? `
  <!-- 出雲地域の特色 -->
  <polygon points="470,120 485,100 500,120" fill="#B0C4DE"/>
  <text x="475" y="135" font-family="serif" font-size="8" fill="#4682B4">出雲</text>
  ` : garden.prefecture === '高知県' ? `
  <!-- 高知地域の特色 -->
  <circle cx="480" cy="110" r="12" fill="#FF4500"/>
  <text x="475" y="130" font-family="serif" font-size="8" fill="#FF4500">土佐</text>
  ` : garden.prefecture === '香川県' ? `
  <!-- 香川地域の特色 -->
  <rect x="470" y="100" width="25" height="15" fill="#FFD700" rx="3"/>
  <text x="475" y="130" font-family="serif" font-size="8" fill="#DAA520">讃岐</text>
  ` : ''}

  <!-- プレミアム小道 -->
  <path d="M 0 320 Q 128 300 256 320 Q 384 340 512 320" stroke="${colors.path}" stroke-width="25" fill="none"/>
  <path d="M 0 318 Q 128 298 256 318 Q 384 338 512 318" stroke="#F0E68C" stroke-width="5" fill="none"/>

  <!-- 評価星（4.6以上） -->
  ${garden.rating >= 4.6 ? `
  <g transform="translate(450, 15)">
    <circle cx="15" cy="15" r="12" fill="rgba(255,215,0,0.9)"/>
    <polygon points="15,8 17,13 22,13 18,16 20,21 15,18 10,21 12,16 8,13 13,13" fill="#FFD700"/>
    <text x="15" y="35" font-family="sans-serif" font-size="8" fill="#333" text-anchor="middle">${garden.rating}</text>
  </g>
  ` : ''}

  <!-- メインタイトル -->
  <rect x="10" y="10" width="${Math.min(garden.name.length * 14 + 50, 400)}" height="45" fill="rgba(255,255,255,0.95)" rx="8" stroke="${colors.accent}" stroke-width="2"/>
  <text x="20" y="35" font-family="serif" font-size="${garden.name.length > 15 ? '12' : garden.name.length > 10 ? '14' : '16'}" fill="#2F4F4F" font-weight="bold">${garden.name}</text>

  <!-- 地域・専門情報 -->
  <rect x="10" y="60" width="${Math.max((garden.prefecture?.length || 0) * 12, 100) + 40}" height="35" fill="rgba(255,255,255,0.9)" rx="5"/>
  <text x="15" y="75" font-family="sans-serif" font-size="11" fill="#666" font-weight="bold">${garden.prefecture || ''}</text>
  ${specialties.length > 0 ? `<text x="15" y="88" font-family="sans-serif" font-size="9" fill="#888">${specialties[0]}</text>` : ''}

  <!-- 特色バッジ -->
  ${isStylish ? `
  <rect x="15" y="105" width="70" height="18" fill="#FF69B4" rx="9"/>
  <text x="50" y="117" font-family="sans-serif" font-size="9" fill="white" text-anchor="middle" font-weight="bold">スタイリッシュ</text>
  ` : isEducational ? `
  <rect x="15" y="105" width="60" height="18" fill="#32CD32" rx="9"/>
  <text x="45" y="117" font-family="sans-serif" font-size="9" fill="white" text-anchor="middle" font-weight="bold">教育施設</text>
  ` : isPotSpecialist ? `
  <rect x="15" y="105" width="50" height="18" fill="#8B4513" rx="9"/>
  <text x="40" y="117" font-family="sans-serif" font-size="9" fill="white" text-anchor="middle" font-weight="bold">高級鉢</text>
  ` : `
  <rect x="15" y="105" width="50" height="18" fill="${colors.accent}" rx="9"/>
  <text x="40" y="117" font-family="sans-serif" font-size="9" fill="white" text-anchor="middle" font-weight="bold">注目園</text>
  `}
</svg>`;
}

async function generatePhase3Diverse() {
  try {
    console.log('🌈 フェーズ3: 地域多様性コレクション画像生成開始...\n');

    // フェーズ3選定園のIDリスト
    const phase3GardenIds = [
      '29a49dbc-e5e1-4201-afe9-0b4a09223095', // 大和魂盆栽
      '323ae2c8-82a0-480a-a0bf-3eeab52baa3a', // ガーデニングサロン 風の散歩道
      '253b3027-463f-4bd9-847e-90547715cb9b', // SOLSO FARM
      'd59a502e-61cb-427e-ac93-bb4da4dfc5f6', // 養庄園
      '3c4f5845-c6f7-47e7-87d5-d68b5cafc0ae', // まつおえんげい
      'b81646b0-261b-4e3b-b6f3-8ebfb2fb0cb9', // さぬき盆栽の郷
      '929b849b-0b11-45b7-b5d8-9bf09cfd64d0', // 神戸盆栽館
      '40a5e7c5-8cb6-46ef-bd83-cb830d7da0cd', // 盆栽四季の杜
      'aec3cb3b-ff22-476a-9728-b52547ab3a98', // 松江盆栽センター
      '9a1819fd-05a1-4d66-9877-bc07607ba19a'  // 見元園芸
    ];

    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, city, specialties, rating, featured, established_year')
      .in('id', phase3GardenIds);

    if (error) {
      console.error('❌ データ取得エラー:', error.message);
      return;
    }

    console.log(`📊 ${gardens.length}件の多様な盆栽園画像を生成します\n`);

    const results = [];
    const codeMap = [];

    for (const garden of gardens) {
      try {
        const rating = garden.rating || '未評価';
        const featured = garden.featured ? '⭐注目' : '';
        console.log(`🎨 ${garden.name} ${featured}`);
        console.log(`   📍 ${garden.prefecture} | ⭐ ${rating}`);

        const fileName = getPhase3FileName(garden.name, garden.id);
        const filePath = `public/images/gardens/${fileName}.svg`;

        console.log(`   → ファイル: ${fileName}.svg`);

        // 多様性重視のSVG生成
        const svgContent = generateDiverseGardenSVG(garden);
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

    console.log('🎉 フェーズ3多様性コレクション画像生成完了！');
    console.log(`✅ 成功: ${results.filter(r => r.success).length}/${gardens.length}件\n`);

    console.log('📋 フェーズ3追加用コードマッピング:');
    console.log('// フェーズ3（地域多様性コレクション）');
    codeMap.forEach(line => console.log(line));

    return results;

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

generatePhase3Diverse();