import fs from 'fs';
import path from 'path';

// フェーズ6対象園の情報（究極拡充コレクション）
const phase6Gardens = [
  {
    id: 'aa02f356-72e3-49dd-9511-fea249002fdf',
    name: '盆栽の森つくば',
    prefecture: '茨城県',
    rating: 4.4,
    featured: true,
    specialties: ['筑波山麓', '週末営業', '隠れ家的'],
    filename: 'bonsai-no-mori-tsukuba.svg'
  },
  {
    id: 'f7d24f87-828d-40ab-a330-8c03b7879a28',
    name: '相模原盆栽の森',
    prefecture: '神奈川県',
    rating: 4.4,
    featured: false,
    specialties: ['自然豊かな環境', '地域密着', '静かな環境'],
    filename: 'sagamihara-bonsai-no-mori.svg'
  },
  {
    id: '1da87f61-d5cc-456c-827b-8a2ef675b68a',
    name: 'GREENSCAPE',
    prefecture: '東京都',
    rating: 4.4,
    featured: true,
    specialties: ['都市型盆栽店', '小品盆栽', '苔玉'],
    filename: 'greenscape.svg'
  },
  {
    id: '8d33d8ac-60a3-49e7-a7b8-4507cfaf0a13',
    name: '横浜中華街盆栽館',
    prefecture: '神奈川県',
    rating: 4.4,
    featured: false,
    specialties: ['中華街立地', '国際環境', '東西文化融合'],
    filename: 'yokohama-chinatown-bonsai-kan.svg'
  },
  {
    id: '8a3ce3f8-8503-4dd7-beee-bbc4d45bf5d3',
    name: '三河盆栽園',
    prefecture: '愛知県',
    rating: 4.4,
    featured: true,
    specialties: ['徳川ゆかり', '江戸時代創業', '武家文化'],
    filename: 'mikawa-bonsai-en.svg'
  },
  {
    id: 'fa96de24-e49e-4dc6-a969-d7e81462a0d5',
    name: '彩の国盆栽センター',
    prefecture: '埼玉県',
    rating: 4.4,
    featured: false,
    specialties: ['県内最大級', '総合施設', '体験教室'],
    filename: 'sainokuni-bonsai-center.svg'
  },
  {
    id: '639402ee-a9e5-459f-8772-463ab6413598',
    name: '江戸川盆栽村',
    prefecture: '東京都',
    rating: 4.4,
    featured: false,
    specialties: ['昭和創業', '小品盆栽', '山野草'],
    filename: 'edogawa-bonsai-mura.svg'
  },
  {
    id: '588e5f53-2541-489d-b991-6b28375df649',
    name: 'ガーデンプラザ華',
    prefecture: '福島県',
    rating: 4.4,
    featured: false,
    specialties: ['大型園芸センター', '盆栽', '庭木'],
    filename: 'garden-plaza-hana.svg'
  },
  {
    id: '5825c02c-84a3-4a56-85fe-e816103aef06',
    name: '宇都宮園芸センター',
    prefecture: '栃木県',
    rating: 4.4,
    featured: false,
    specialties: ['総合園芸', '盆栽', '庭木'],
    filename: 'utsunomiya-engei-center.svg'
  },
  {
    id: 'e4ac72e0-8a4b-410e-9e99-d9f6778b7b9f',
    name: '岡山グリーンセンター',
    prefecture: '岡山県',
    rating: 4.4,
    featured: true,
    specialties: ['総合園芸', '盆栽', '庭木'],
    filename: 'okayama-green-center.svg'
  },
  {
    id: '9d395b67-bad0-44fe-87fb-7b4df3417307',
    name: '赤城山盆栽工房',
    prefecture: '群馬県',
    rating: 4.2,
    featured: false,
    specialties: ['赤城山環境', '山野草', '郷土色'],
    filename: 'akagisan-bonsai-koubou.svg'
  },
  {
    id: '500e6ae7-92bd-4758-8550-a50ca2baaa60',
    name: 'ザ・ガーデン 本店 ヨネヤマプランテイション',
    prefecture: '神奈川県',
    rating: 4.2,
    featured: true,
    specialties: ['観葉植物', '多肉植物', '盆栽'],
    filename: 'the-garden-yoneyama-plantation.svg'
  },
  {
    id: '5f6ef2d7-6540-4a1c-9739-1dc48254fa8e',
    name: '山中樹楽園',
    prefecture: '東京都',
    rating: 4.2,
    featured: false,
    specialties: ['山野草', '雑木盆栽', '植木'],
    filename: 'yamanaka-juraku-en.svg'
  },
  {
    id: 'bc8f2e83-04cb-48a0-b213-75d1e6b09fee',
    name: 'あゆみ野農協安行園芸センター',
    prefecture: '埼玉県',
    rating: 4.2,
    featured: true,
    specialties: ['植木', '苗木', '盆栽'],
    filename: 'ayumino-nokyo-angyou-engei-center.svg'
  },
  {
    id: '5f2057cb-4757-428f-befc-4af8e6bef25b',
    name: '上州盆栽園',
    prefecture: '群馬県',
    rating: 4.2,
    featured: false,
    specialties: ['寒暖差活用', '松柏類専門', '職人気質'],
    filename: 'joshu-bonsai-en.svg'
  },
  {
    id: 'aaab7bde-68f9-4ccb-8e78-871ca5ee8fc5',
    name: '印旛沼盆栽園',
    prefecture: '千葉県',
    rating: 4.2,
    featured: false,
    specialties: ['印旛沼立地', '水辺環境活用', '湿度管理'],
    filename: 'inbanuma-bonsai-en.svg'
  },
  {
    id: '8c90b21d-54dd-4811-b5b7-1282f3fb1f25',
    name: '薩摩園芸センター',
    prefecture: '鹿児島県',
    rating: 4.2,
    featured: false,
    specialties: ['総合園芸', '南国植物', '盆栽'],
    filename: 'satsuma-engei-center.svg'
  },
  {
    id: '3cc5336e-28ba-4555-b834-351436bdbca0',
    name: '近江園芸センター',
    prefecture: '滋賀県',
    rating: 4.2,
    featured: false,
    specialties: ['総合園芸', '盆栽', '湖国植物'],
    filename: 'omi-engei-center.svg'
  },
  {
    id: '8ed687ca-0e7a-470a-9960-5dfa1592d088',
    name: '株式会社ナカツタヤ',
    prefecture: '山梨県',
    rating: 4.2,
    featured: false,
    specialties: ['種苗', 'ガーデニング用品', '盆栽'],
    filename: 'nakatsutaya.svg'
  },
  {
    id: '9a9dc214-6dd8-4d31-ba99-a2e475d302f8',
    name: '春日緑化株式会社',
    prefecture: '大分県',
    rating: 4.2,
    featured: false,
    specialties: ['造園施工', '日本庭園', '盆栽'],
    filename: 'kasuga-ryokka.svg'
  },
  {
    id: '174b8907-df0e-492c-a93a-adf2bc868081',
    name: '霞ヶ浦盆栽園',
    prefecture: '茨城県',
    rating: 4.0,
    featured: false,
    specialties: ['霞ヶ浦展望', '丘陵地立地', '景観抜群'],
    filename: 'kasumigaura-bonsai-en.svg'
  },
  {
    id: '78e25ed5-8a97-4a3e-9f3d-77fdd5054e8b',
    name: 'グリーンファーム東大阪',
    prefecture: '大阪府',
    rating: 4.0,
    featured: false,
    specialties: ['工業地帯', '製造業対応', '工場緑化'],
    filename: 'green-farm-higashiosaka.svg'
  },
  {
    id: '6b9181e5-f2df-4c32-a2ad-5700ac7f866f',
    name: '植木屋本舗',
    prefecture: '佐賀県',
    rating: 4.0,
    featured: false,
    specialties: ['陶芸融合', '庭園デザイン', '九州温暖'],
    filename: 'uekiya-honpo.svg'
  },
  {
    id: '63515450-e9f3-40f6-852d-b726e7ea7552',
    name: '花の庭',
    prefecture: '富山県',
    rating: 4.0,
    featured: false,
    specialties: ['立山連峰', '薬草植物', '高山植物'],
    filename: 'hana-no-niwa.svg'
  },
  {
    id: 'a035baf6-e9e9-427c-8245-10e6d0c11435',
    name: '中川造園',
    prefecture: '茨城県',
    rating: 4.0,
    featured: false,
    specialties: ['松手入れ', '年間管理', '植木消毒'],
    filename: 'nakagawa-zouen.svg'
  }
];

// 地域ごとの色設定とテーマ（フェーズ6拡張版）
const regionSettings = {
  '茨城県': { primaryColor: '#4ECDC4', secondaryColor: '#45B7B8', theme: 'lakeside' },
  '神奈川県': { primaryColor: '#74B9FF', secondaryColor: '#0984E3', theme: 'coastal' },
  '東京都': { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4', theme: 'urban' },
  '愛知県': { primaryColor: '#FF7675', secondaryColor: '#FD79A8', theme: 'historical' },
  '埼玉県': { primaryColor: '#00B894', secondaryColor: '#00CEC9', theme: 'suburban' },
  '福島県': { primaryColor: '#6C5CE7', secondaryColor: '#A29BFE', theme: 'mountain' },
  '栃木県': { primaryColor: '#A29BFE', secondaryColor: '#6C5CE7', theme: 'highland' },
  '岡山県': { primaryColor: '#FDCB6E', secondaryColor: '#E84393', theme: 'western' },
  '群馬県': { primaryColor: '#E17055', secondaryColor: '#DDA0DD', theme: 'mountain' },
  '千葉県': { primaryColor: '#FDCB6E', secondaryColor: '#E84393', theme: 'rural' },
  '鹿児島県': { primaryColor: '#00CEC9', secondaryColor: '#55EFC4', theme: 'volcanic' },
  '滋賀県': { primaryColor: '#74B9FF', secondaryColor: '#0984E3', theme: 'lake' },
  '山梨県': { primaryColor: '#A29BFE', secondaryColor: '#6C5CE7', theme: 'alpine' },
  '大分県': { primaryColor: '#FF9F43', secondaryColor: '#74B9FF', theme: 'hot_spring' },
  '大阪府': { primaryColor: '#FF9F43', secondaryColor: '#74B9FF', theme: 'commercial' },
  '佐賀県': { primaryColor: '#E17055', secondaryColor: '#DDA0DD', theme: 'ceramic' },
  '富山県': { primaryColor: '#A29BFE', secondaryColor: '#6C5CE7', theme: 'alpine' }
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
    case 'lakeside':
      return `
        <!-- 湖畔要素 -->
        <ellipse cx="400" cy="350" rx="60" ry="15" fill="${colors.secondaryColor}" opacity="0.6"/>
        <circle cx="460" cy="140" r="12" fill="#87CEEB"/>
        <path d="M 350 355 Q 400 345 450 355" stroke="${colors.primaryColor}" stroke-width="3" fill="none"/>
      `;
    case 'volcanic':
      return `
        <!-- 火山要素 -->
        <polygon points="420,100 440,140 460,100" fill="#FF6347" opacity="0.7"/>
        <circle cx="440" cy="120" r="8" fill="#FFD700"/>
        <rect x="380" y="330" width="80" height="20" fill="${colors.primaryColor}" opacity="0.4" rx="5"/>
      `;
    case 'lake':
      return `
        <!-- 湖要素 -->
        <ellipse cx="350" cy="340" rx="80" ry="20" fill="${colors.secondaryColor}" opacity="0.5"/>
        <path d="M 280 350 Q 350 340 420 350" stroke="#4682B4" stroke-width="4" fill="none"/>
        <circle cx="460" cy="130" r="10" fill="#87CEEB"/>
      `;
    case 'ceramic':
      return `
        <!-- 陶芸要素 -->
        <rect x="400" y="300" width="40" height="60" fill="${colors.primaryColor}" opacity="0.3" rx="8"/>
        <circle cx="420" cy="330" r="15" fill="#8B4513"/>
        <rect x="410" y="320" width="20" height="20" fill="#DEB887" rx="3"/>
      `;
    case 'hot_spring':
      return `
        <!-- 温泉要素 -->
        <circle cx="450" cy="150" r="20" fill="#FFD700" opacity="0.7"/>
        <path d="M 440 140 Q 450 130 460 140" stroke="#FF6347" stroke-width="2" fill="none"/>
        <ellipse cx="380" cy="340" rx="30" ry="10" fill="${colors.secondaryColor}" opacity="0.6"/>
      `;
    case 'western':
      return `
        <!-- 西日本要素 -->
        <polygon points="400,120 420,100 440,120 460,100 480,120" fill="#FFD700" opacity="0.6"/>
        <circle cx="350" cy="330" r="12" fill="#FF7F50"/>
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
  <rect x="10" y="10" width="${Math.min(garden.name.length * 11 + 20, 300)}" height="45" fill="rgba(255,255,255,0.95)" rx="8" stroke="${regionSetting.primaryColor}" stroke-width="2"/>
  <text x="20" y="35" font-family="serif" font-size="15" fill="#2F4F4F" font-weight="bold">${garden.name}</text>

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

async function generatePhase6Images() {
  console.log('🚀 フェーズ6: 究極拡充コレクション画像生成開始...\n');
  console.log(`📊 ${phase6Gardens.length}件の究極拡充園画像を生成します\n`);

  const outputDir = './public/images/gardens';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  const mappingEntries = [];

  for (const garden of phase6Gardens) {
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

  console.log('🎉 フェーズ6究極拡充コレクション画像生成完了！');
  console.log(`✅ 成功: ${successCount}/${phase6Gardens.length}件\n`);

  console.log('📋 フェーズ6追加用コードマッピング:');
  console.log('// フェーズ6（究極拡充コレクション）');
  mappingEntries.forEach(entry => console.log(entry));
}

generatePhase6Images();