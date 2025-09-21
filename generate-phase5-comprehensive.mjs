import fs from 'fs';
import path from 'path';

// フェーズ5対象園の情報（全国総合拡充）
const phase5Gardens = [
  {
    id: 'fe68bd0f-0a04-4c35-b721-ae89c2963247',
    name: '浪華盆栽園',
    prefecture: '大阪府',
    rating: 4.5,
    featured: true,
    specialties: ['老舗盆栽園', '松柏類', '花物盆栽'],
    filename: 'naniwa-bonsai-en.svg'
  },
  {
    id: '7163682f-97fd-4178-bf2f-f64683af32fc',
    name: '総合園芸 Barns',
    prefecture: '石川県',
    rating: 4.5,
    featured: false,
    specialties: ['総合園芸', '盆栽', '観葉植物'],
    filename: 'sogou-engei-barns.svg'
  },
  {
    id: 'a45f1770-9d15-40c7-a9b3-332f9edc0530',
    name: '四国グリーンセンター',
    prefecture: '愛媛県',
    rating: 4.5,
    featured: true,
    specialties: ['総合園芸', '盆栽', '造園'],
    filename: 'shikoku-green-center.svg'
  },
  {
    id: '4557fb2e-7e5f-488e-8ef4-55b3a95dd60d',
    name: '北山ナーセリー',
    prefecture: '富山県',
    rating: 4.5,
    featured: true,
    specialties: ['北陸最大級園芸店', '盆栽', 'ガーデニング用品'],
    filename: 'kitayama-nursery.svg'
  },
  {
    id: 'd85b297c-528c-4861-8f7b-e07a6beef5d1',
    name: 'ガーデンマルシェ 下関店',
    prefecture: '山口県',
    rating: 4.5,
    featured: true,
    specialties: ['観葉植物', '多肉植物', '盆栽'],
    filename: 'garden-marche-shimonoseki.svg'
  },
  {
    id: 'fc9f4072-151e-463f-8acc-e20935740398',
    name: '富士山麓ガーデンセンター',
    prefecture: '静岡県',
    rating: 4.5,
    featured: true,
    specialties: ['富士山麓', '標高500m', '高原植物'],
    filename: 'fujisan-roku-garden-center.svg'
  },
  {
    id: '7d49d321-50a2-4729-b6bd-8f100dbc7e19',
    name: 'サカタのタネガーデンセンター相模原',
    prefecture: '神奈川県',
    rating: 4.5,
    featured: true,
    specialties: ['種子専門', '壁面展示', '屋根付売場'],
    filename: 'sakata-no-tane-sagamihara.svg'
  },
  {
    id: 'a7c48e64-0ab4-46ed-9e85-6d533364ba4f',
    name: '有限会社豊香園',
    prefecture: '岩手県',
    rating: 4.5,
    featured: true,
    specialties: ['慶応創業', '石割桜管理', '老舗造園'],
    filename: 'houkoen.svg'
  },
  {
    id: '58e02c92-8918-4212-9560-c56e31606724',
    name: '緑花木市場',
    prefecture: '千葉県',
    rating: 4.5,
    featured: true,
    specialties: ['千葉最大級', '植木の町', '道の駅'],
    filename: 'ryokuka-ki-ichiba.svg'
  },
  {
    id: '5ec52f80-073d-45d0-aae2-b72f11672721',
    name: 'ガーデニング倶楽部花みどり',
    prefecture: '徳島県',
    rating: 4.5,
    featured: true,
    specialties: ['大型総合', '阿波文化', '現代融合'],
    filename: 'gardening-club-hanamidori.svg'
  },
  {
    id: '1c839911-a0bb-40cd-9733-5945a1192270',
    name: '小林農園',
    prefecture: '福井県',
    rating: 4.5,
    featured: true,
    specialties: ['北陸最大級', '5000商品', '雪国対応'],
    filename: 'kobayashi-nouen.svg'
  },
  {
    id: 'c8ddaa61-7922-40b8-8133-7b1e0ab36e9c',
    name: '四国ガーデン',
    prefecture: '愛媛県',
    rating: 4.5,
    featured: true,
    specialties: ['四国最大級', '瀬戸内気候', '園芸教室'],
    filename: 'shikoku-garden.svg'
  },
  {
    id: 'c5abd99b-808b-48fd-b5f2-8353385ac719',
    name: '協同組合日本ライン花木センター',
    prefecture: '岐阜県',
    rating: 4.5,
    featured: true,
    specialties: ['東海最大級', '総面積40,000㎡', '温室植物'],
    filename: 'nihon-line-kaboku-center.svg'
  },
  {
    id: '77a2d6e0-8b2a-455e-af37-7d4cd89257c7',
    name: '藤川光花園',
    prefecture: '大阪府',
    rating: 4.5,
    featured: true,
    specialties: ['小品盆栽', '大品盆栽', '技術指導'],
    filename: 'fujikawa-kouka-en.svg'
  },
  {
    id: '1191e28b-15ef-4363-b43e-8ed007154b22',
    name: '小品盆栽 季の風',
    prefecture: '東京都',
    rating: 4.5,
    featured: false,
    specialties: ['小品盆栽', '季節感', '都市型'],
    filename: 'shohin-bonsai-ki-no-kaze.svg'
  },
  {
    id: '29d8a441-bdd5-4fc5-8514-164ff37e3234',
    name: '大洋グリーン',
    prefecture: '愛知県',
    rating: 4.5,
    featured: true,
    specialties: ['バラ専門', 'モミジ', '庭園設計'],
    filename: 'taiyo-green.svg'
  },
  {
    id: 'c62357fb-f3de-4aa4-add5-eb1bb7f95922',
    name: '那須高原盆栽の里',
    prefecture: '栃木県',
    rating: 4.4,
    featured: false,
    specialties: ['高原環境', '高山植物', '避暑地盆栽'],
    filename: 'nasu-kogen-bonsai-no-sato.svg'
  },
  {
    id: 'b2974592-38df-4f4b-907b-e5fe1df60620',
    name: '盆栽福島園',
    prefecture: '千葉県',
    rating: 4.4,
    featured: true,
    specialties: ['老舗盆栽', '総合サービス', 'レンタル'],
    filename: 'bonsai-fukushima-en.svg'
  },
  {
    id: 'd890f754-cf36-4724-bdd0-ee07b95b4a88',
    name: '小品盆栽専門店 やまと園',
    prefecture: '神奈川県',
    rating: 4.4,
    featured: false,
    specialties: ['小品盆栽', '管理指導', '初心者対応'],
    filename: 'shohin-bonsai-yamato-en.svg'
  },
  {
    id: '9edd8075-1637-4f74-8f42-8b3f689785bc',
    name: '萬樹園',
    prefecture: '東京都',
    rating: 4.4,
    featured: false,
    specialties: ['雑木盆栽', '個人指導', '盆栽文化継承'],
    filename: 'manju-en.svg'
  }
];

// 地域ごとの色設定とテーマ（フェーズ5拡張版）
const regionSettings = {
  '大阪府': { primaryColor: '#FF9F43', secondaryColor: '#74B9FF', theme: 'commercial' },
  '石川県': { primaryColor: '#6C5CE7', secondaryColor: '#A29BFE', theme: 'crafts' },
  '愛媛県': { primaryColor: '#00CEC9', secondaryColor: '#55EFC4', theme: 'setouchi' },
  '富山県': { primaryColor: '#A29BFE', secondaryColor: '#6C5CE7', theme: 'alpine' },
  '山口県': { primaryColor: '#FF7675', secondaryColor: '#FD79A8', theme: 'seaside' },
  '静岡県': { primaryColor: '#00B894', secondaryColor: '#81ECEC', theme: 'mountain' },
  '神奈川県': { primaryColor: '#74B9FF', secondaryColor: '#0984E3', theme: 'coastal' },
  '岩手県': { primaryColor: '#A29BFE', secondaryColor: '#6C5CE7', theme: 'northern' },
  '千葉県': { primaryColor: '#FDCB6E', secondaryColor: '#E84393', theme: 'rural' },
  '徳島県': { primaryColor: '#6C5CE7', secondaryColor: '#A29BFE', theme: 'traditional' },
  '福井県': { primaryColor: '#00B894', secondaryColor: '#00CEC9', theme: 'snow' },
  '岐阜県': { primaryColor: '#FD79A8', secondaryColor: '#FDCB6E', theme: 'mountain' },
  '東京都': { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4', theme: 'urban' },
  '愛知県': { primaryColor: '#FF7675', secondaryColor: '#FD79A8', theme: 'industrial' },
  '栃木県': { primaryColor: '#A29BFE', secondaryColor: '#6C5CE7', theme: 'highland' }
};

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
    case 'crafts':
      return `
        <!-- 工芸要素 -->
        <rect x="400" y="120" width="60" height="40" fill="${colors.primaryColor}" opacity="0.3" rx="8"/>
        <circle cx="430" cy="140" r="8" fill="#FFD700"/>
        <path d="M 420 140 L 440 140" stroke="#8B4513" stroke-width="2"/>
      `;
    case 'setouchi':
      return `
        <!-- 瀬戸内要素 -->
        <circle cx="450" cy="150" r="15" fill="#FFD700" opacity="0.8"/>
        <path d="M 0 350 Q 128 340 256 350 Q 384 360 512 350" stroke="${colors.secondaryColor}" stroke-width="6" fill="none" opacity="0.8"/>
        <ellipse cx="350" cy="340" rx="25" ry="8" fill="${colors.primaryColor}" opacity="0.4"/>
      `;
    case 'alpine':
      return `
        <!-- 高山要素 -->
        <polygon points="420,80 440,120 460,80 480,120 500,80" fill="#9370DB" opacity="0.7"/>
        <circle cx="380" cy="320" r="6" fill="#4169E1"/>
        <circle cx="400" cy="315" r="8" fill="#4169E1"/>
      `;
    case 'seaside':
      return `
        <!-- 海辺要素 -->
        <path d="M 0 360 Q 128 350 256 360 Q 384 370 512 360" stroke="${colors.secondaryColor}" stroke-width="12" fill="none" opacity="0.6"/>
        <circle cx="460" cy="140" r="10" fill="#87CEEB"/>
        <circle cx="440" cy="130" r="6" fill="#87CEEB"/>
      `;
    case 'northern':
      return `
        <!-- 北国要素 -->
        <polygon points="60,100 90,80 120,100 150,80 180,100" fill="#B0E0E6" opacity="0.6"/>
        <rect x="420" y="290" width="60" height="50" fill="${colors.primaryColor}" opacity="0.2" rx="8"/>
      `;
    case 'rural':
      return `
        <!-- 田園要素 -->
        <rect x="300" y="330" width="80" height="20" fill="#90EE90" opacity="0.6" rx="3"/>
        <circle cx="470" cy="160" r="12" fill="#FFFF00" opacity="0.7"/>
      `;
    case 'snow':
      return `
        <!-- 雪国要素 -->
        <circle cx="450" cy="120" r="8" fill="#F0F8FF"/>
        <circle cx="470" cy="110" r="6" fill="#F0F8FF"/>
        <circle cx="430" cy="115" r="5" fill="#F0F8FF"/>
        <polygon points="80,120 110,100 140,120" fill="#E6E6FA" opacity="0.7"/>
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

  <!-- 地域特色の装飾 -->
  <rect x="460" y="200" width="40" height="60" fill="rgba(139,69,19,0.3)" rx="5"/>
  <text x="465" y="220" font-family="serif" font-size="8" fill="#654321">${garden.prefecture.slice(0, 2)}</text>
  <text x="465" y="235" font-family="serif" font-size="8" fill="#654321">特色</text>

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
  <rect x="10" y="10" width="${Math.min(garden.name.length * 12 + 20, 280)}" height="45" fill="rgba(255,255,255,0.95)" rx="8" stroke="${regionSetting.primaryColor}" stroke-width="2"/>
  <text x="20" y="35" font-family="serif" font-size="16" fill="#2F4F4F" font-weight="bold">${garden.name}</text>

  <!-- 地域情報 -->
  <rect x="10" y="60" width="80" height="30" fill="rgba(255,255,255,0.9)" rx="5"/>
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

async function generatePhase5Images() {
  console.log('🚀 フェーズ5: 総合拡充コレクション画像生成開始...\n');
  console.log(`📊 ${phase5Gardens.length}件の総合拡充園画像を生成します\n`);

  const outputDir = './public/images/gardens';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  const mappingEntries = [];

  for (const garden of phase5Gardens) {
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

  console.log('🎉 フェーズ5総合拡充コレクション画像生成完了！');
  console.log(`✅ 成功: ${successCount}/${phase5Gardens.length}件\n`);

  console.log('📋 フェーズ5追加用コードマッピング:');
  console.log('// フェーズ5（総合拡充コレクション）');
  mappingEntries.forEach(entry => console.log(entry));
}

generatePhase5Images();