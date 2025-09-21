import fs from 'fs';
import path from 'path';

// フェーズ4対象園の情報
const phase4Gardens = [
  {
    id: '299bced1-91e7-424b-bdd3-6391ccc5c622',
    name: 'オザキフラワーパーク',
    prefecture: '東京都',
    rating: 4.6,
    featured: true,
    specialties: ['東京最大級', '植物パワー', '豊富品揃'],
    filename: 'ozaki-flower-park.svg'
  },
  {
    id: '34dd9a7c-45cd-467b-9650-dd919ef51373',
    name: '山城愛仙園',
    prefecture: '大阪府',
    rating: 4.6,
    featured: true,
    specialties: ['サボテン専門', '多肉植物', '創業1962年'],
    filename: 'yamashiro-aisen-en.svg'
  },
  {
    id: '43bef990-75ae-431b-bcd9-3627879cf4eb',
    name: '阿波園',
    prefecture: '徳島県',
    rating: 4.6,
    featured: true,
    specialties: ['日本蘭', '東洋蘭', '春蘭'],
    filename: 'awa-en.svg'
  },
  {
    id: '96aa3db9-0ea0-4f13-9768-1c81f6ad3416',
    name: '花ひろば',
    prefecture: '三重県',
    rating: 4.6,
    featured: true,
    specialties: ['東海最大級', '6000坪', '果樹苗'],
    filename: 'hana-hiroba.svg'
  },
  {
    id: '97e7553f-109d-4631-939a-8d292eeb625b',
    name: '班樹園グリーンセンター',
    prefecture: '沖縄県',
    rating: 4.6,
    featured: true,
    specialties: ['熱帯植物', 'ガジュマル', 'ソテツ'],
    filename: 'hanju-en-green-center.svg'
  },
  {
    id: 'f3418bb6-eef6-47a7-8c54-905ed1d6d3cb',
    name: '浜北営農緑花木センター',
    prefecture: '静岡県',
    rating: 4.6,
    featured: true,
    specialties: ['県内最大級', '植物テーマパーク', '3,000種'],
    filename: 'hamakita-eino-ryokka-center.svg'
  },
  {
    id: 'c461d493-c16b-4b45-9a26-e3e15624e3c4',
    name: '古樹園',
    prefecture: '京都府',
    rating: 4.6,
    featured: true,
    specialties: ['小品盆栽', '古鉢', '盆栽教室'],
    filename: 'koju-en.svg'
  },
  {
    id: '1f54a5e8-d50a-438f-aecd-67b9f2499903',
    name: '高松盆栽の郷',
    prefecture: '香川県',
    rating: 4.6,
    featured: true,
    specialties: ['黒松', '五葉松', '赤松'],
    filename: 'takamatsu-bonsai-no-sato.svg'
  },
  {
    id: 'a38daf6e-445f-481b-a9a8-55ea631428e3',
    name: 'かまくら木花草',
    prefecture: '神奈川県',
    rating: 4.5,
    featured: true,
    specialties: ['小品盆栽', '初心者教室', '鎌倉文化'],
    filename: 'kamakura-kibana-so.svg'
  },
  {
    id: '7cb38263-35fd-4fdb-b0a5-9c31227d6ebc',
    name: '川口BONSAI村',
    prefecture: '埼玉県',
    rating: 4.5,
    featured: true,
    specialties: ['ミニ盆栽', '小品盆栽', '盆栽鉢'],
    filename: 'kawaguchi-bonsai-mura.svg'
  },
  {
    id: '2a93e2ed-3bea-4855-b69c-9d5df4d0d1e3',
    name: '那須高原盆栽センター',
    prefecture: '栃木県',
    rating: 4.5,
    featured: true,
    specialties: ['那須高原立地', '標高500m', '涼しい気候'],
    filename: 'nasu-kogen-bonsai-center.svg'
  },
  {
    id: '0a120c74-2bf1-4ca1-a16c-b34865967245',
    name: '横浜港北盆栽苑',
    prefecture: '神奈川県',
    rating: 4.5,
    featured: false,
    specialties: ['家族経営', '三世代継承', 'アットホーム'],
    filename: 'yokohama-kohoku-bonsai-en.svg'
  },
  {
    id: 'd432d4bf-908e-4952-86c5-b8c5798a1225',
    name: '上野グリーンクラブ',
    prefecture: '東京都',
    rating: 4.5,
    featured: false,
    specialties: ['愛好家集会所', '連盟拠点', '技術指導'],
    filename: 'ueno-green-club.svg'
  },
  {
    id: '6897be01-8059-41b6-9749-436eebb5e678',
    name: '名古屋盆栽会館',
    prefecture: '愛知県',
    rating: 4.5,
    featured: true,
    specialties: ['中部地方中心', '展示館併設', '盆栽展開催'],
    filename: 'nagoya-bonsai-kaikan.svg'
  },
  {
    id: '71d984be-89d6-427c-a27c-0139fbc3e889',
    name: '嵯峨野盆栽苑',
    prefecture: '京都府',
    rating: 4.5,
    featured: true,
    specialties: ['嵯峨野立地', '自然環境', '竹林調和'],
    filename: 'sagano-bonsai-en.svg'
  }
];

// 地域ごとの色設定とテーマ
const regionSettings = {
  '東京都': { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4', theme: 'urban' },
  '大阪府': { primaryColor: '#FF9F43', secondaryColor: '#74B9FF', theme: 'commercial' },
  '徳島県': { primaryColor: '#6C5CE7', secondaryColor: '#A29BFE', theme: 'traditional' },
  '三重県': { primaryColor: '#FD79A8', secondaryColor: '#FDCB6E', theme: 'natural' },
  '沖縄県': { primaryColor: '#00CEC9', secondaryColor: '#55EFC4', theme: 'tropical' },
  '静岡県': { primaryColor: '#00B894', secondaryColor: '#81ECEC', theme: 'mountain' },
  '京都府': { primaryColor: '#E17055', secondaryColor: '#DDA0DD', theme: 'historical' },
  '香川県': { primaryColor: '#FDCB6E', secondaryColor: '#E84393', theme: 'island' },
  '神奈川県': { primaryColor: '#74B9FF', secondaryColor: '#0984E3', theme: 'coastal' },
  '埼玉県': { primaryColor: '#00B894', secondaryColor: '#00CEC9', theme: 'suburban' },
  '栃木県': { primaryColor: '#A29BFE', secondaryColor: '#6C5CE7', theme: 'highland' },
  '愛知県': { primaryColor: '#FF7675', secondaryColor: '#FD79A8', theme: 'industrial' }
};

function sanitizeFilename(filename) {
  return filename
    .replace(/[\s\-・]/g, '-')
    .replace(/[^\w\-\.]/g, '')
    .toLowerCase();
}

function generateSpecialtyElements(specialties, regionColor) {
  const elements = [];

  specialties.forEach((specialty, index) => {
    const y = 90 + (index * 12);
    elements.push(`<text x="355" y="${y}" font-family="sans-serif" font-size="8" fill="#333">• ${specialty}</text>`);
  });

  return elements.join('');
}

function generateThemeSpecificElements(theme, colors) {
  switch (theme) {
    case 'tropical':
      return `
        <!-- 熱帯要素 -->
        <circle cx="450" cy="150" r="20" fill="#FFD700" opacity="0.8"/>
        <path d="M 440 150 Q 450 130 460 150 Q 450 170 440 150" fill="#FF6347"/>
        <ellipse cx="300" cy="340" rx="40" ry="15" fill="${colors.primaryColor}" opacity="0.3"/>
      `;
    case 'mountain':
      return `
        <!-- 山岳要素 -->
        <polygon points="400,100 420,140 440,100 460,140 480,100" fill="#8FBC8F" opacity="0.7"/>
        <circle cx="350" cy="330" r="8" fill="#A0522D"/>
        <circle cx="380" cy="335" r="6" fill="#A0522D"/>
      `;
    case 'coastal':
      return `
        <!-- 海岸要素 -->
        <path d="M 0 350 Q 128 340 256 350 Q 384 360 512 350" stroke="${colors.secondaryColor}" stroke-width="8" fill="none" opacity="0.6"/>
        <circle cx="460" cy="120" r="12" fill="#87CEEB"/>
      `;
    case 'highland':
      return `
        <!-- 高原要素 -->
        <polygon points="50,120 80,100 110,120 140,100 170,120" fill="#9370DB" opacity="0.5"/>
        <rect x="400" y="300" width="80" height="40" fill="${colors.primaryColor}" opacity="0.2" rx="5"/>
      `;
    default:
      return '';
  }
}

function generateGardenSVG(garden) {
  const regionSetting = regionSettings[garden.prefecture] || regionSettings['東京都'];
  const specialtyText = generateSpecialtyElements(garden.specialties.slice(0, 3), regionSetting.primaryColor);
  const themeElements = generateThemeSpecificElements(regionSetting.theme, regionSetting);

  return `<svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:${regionSetting.secondaryColor};stop-opacity:0.3" />
    </linearGradient>
    <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${regionSetting.primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B4513;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="treeGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#32CD32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#228B22;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- 背景 -->
  <rect width="512" height="384" fill="url(#skyGradient)"/>

  <!-- 地面レイヤー -->
  <rect x="0" y="280" width="512" height="104" fill="#90EE90"/>

  <!-- メイン建物 -->
  <rect x="50" y="200" width="200" height="100" fill="url(#buildingGradient)"/>
  <polygon points="50,200 150,150 250,200" fill="${regionSetting.primaryColor}"/>

  <!-- 盆栽コレクション -->
  <circle cx="340" cy="250" r="35" fill="url(#treeGradient)"/>
  <rect x="335" y="250" width="10" height="30" fill="#8B4513"/>

  <circle cx="390" cy="260" r="30" fill="url(#treeGradient)"/>
  <rect x="385" y="260" width="10" height="25" fill="#8B4513"/>

  <circle cx="430" cy="240" r="25" fill="url(#treeGradient)"/>
  <rect x="425" y="240" width="8" height="20" fill="#8B4513"/>

  ${themeElements}

  <!-- 装飾的な小道 -->
  <path d="M 0 320 Q 128 310 256 320 Q 384 330 512 320" stroke="#D2B48C" stroke-width="20" fill="none"/>
  <path d="M 0 318 Q 128 308 256 318 Q 384 328 512 318" stroke="#E6D3A3" stroke-width="4" fill="none"/>

  <!-- 評価星 -->
  <g transform="translate(450, 20)">
    <circle cx="15" cy="15" r="12" fill="rgba(255,215,0,0.8)"/>
    <polygon points="15,8 17,13 22,13 18,16 20,21 15,18 10,21 12,16 8,13 13,13" fill="#FFD700"/>
    <text x="15" y="35" font-family="sans-serif" font-size="8" fill="#333" text-anchor="middle">${garden.rating}</text>
  </g>

  <!-- メインタイトル -->
  <rect x="10" y="10" width="${garden.name.length * 12 + 20}" height="45" fill="rgba(255,255,255,0.95)" rx="8" stroke="${regionSetting.primaryColor}" stroke-width="2"/>
  <text x="20" y="35" font-family="serif" font-size="18" fill="#2F4F4F" font-weight="bold">${garden.name}</text>

  <!-- 地域情報 -->
  <rect x="10" y="60" width="66" height="30" fill="rgba(255,255,255,0.9)" rx="5"/>
  <text x="15" y="75" font-family="sans-serif" font-size="11" fill="#666">${garden.prefecture}</text>

  <!-- 専門分野表示 -->
  <rect x="350" y="60" width="150" height="${garden.specialties.length * 12 + 30}" fill="rgba(255,255,255,0.9)" rx="5"/>
  <text x="355" y="75" font-family="sans-serif" font-size="9" fill="#666" font-weight="bold">専門分野</text>
  ${specialtyText}

  ${garden.featured ? `
  <!-- 注目園バッジ -->
  <rect x="15" y="100" width="60" height="20" fill="${regionSetting.primaryColor}" rx="10"/>
  <text x="45" y="113" font-family="sans-serif" font-size="10" fill="white" text-anchor="middle" font-weight="bold">注目園</text>
  ` : ''}
</svg>`;
}

async function generatePhase4Images() {
  console.log('🚀 フェーズ4: 全国拡充コレクション画像生成開始...\n');
  console.log(`📊 ${phase4Gardens.length}件の拡充園画像を生成します\n`);

  const outputDir = './public/images/gardens';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  const mappingEntries = [];

  for (const garden of phase4Gardens) {
    try {
      console.log(`🎨 ${garden.name} ${garden.featured ? '⭐注目' : ''}`);
      console.log(`   📍 ${garden.prefecture} | ⭐ ${garden.rating}`);
      console.log(`   → ファイル: ${garden.filename}`);

      const svgContent = generateGardenSVG(garden);
      const outputPath = path.join(outputDir, garden.filename);

      fs.writeFileSync(outputPath, svgContent);

      mappingEntries.push(`  '${garden.id}': '/images/gardens/${garden.filename}', // ${garden.name}`);

      console.log('   ✅ 生成完了\n');
      successCount++;

    } catch (error) {
      console.error(`   ❌ エラー: ${error.message}\n`);
    }
  }

  console.log('🎉 フェーズ4全国拡充コレクション画像生成完了！');
  console.log(`✅ 成功: ${successCount}/${phase4Gardens.length}件\n`);

  console.log('📋 フェーズ4追加用コードマッピング:');
  console.log('// フェーズ4（全国拡充コレクション）');
  mappingEntries.forEach(entry => console.log(entry));
}

generatePhase4Images();