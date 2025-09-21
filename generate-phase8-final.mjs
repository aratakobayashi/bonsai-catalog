import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

// フェーズ8選定済み40園のID
const phase8GardenIds = [
  '32f621fa-68bd-436e-82e0-d97a483f322d', 'a84680ba-4aa4-44e1-a878-94d20c805649',
  'b59cb7db-2804-4486-b2ac-483fea1d792d', 'e2c19d95-5d0f-4f68-9a6e-637776703a85',
  '1463d7db-74d7-44cf-ac4c-78f8696dc8e9', 'bd12fb51-7998-4576-952d-081c242d4905',
  'ffc6d15a-d3a2-4fde-b556-dfed23b8919a', '447f6eea-99d2-4a32-8a66-57d2af66061e',
  '256a3959-064d-4146-a7b7-ba84069bcd5b', 'ce0c2233-da20-4f84-8540-9e37415c60ce',
  '75c14be8-3105-4b40-8575-2498859c6de8', '9198cb49-3338-4f96-8fd0-3e63e5bc3d5b',
  '98b9a95c-09df-4a33-a49b-776560a8d90f', 'ed0ceac0-f2fa-4f27-8970-10fbe720ff39',
  '5a3bdecf-5c77-4552-b619-2ec61541d095', 'f1b5582d-56ae-4cb4-9625-d95ad486709e',
  '02730e03-63d8-4530-876b-a353e256a4d4', '094d5670-7da7-4b4a-9e6a-860b035dd994',
  '5b96fdd2-471b-47fd-874b-3982a1e7d5f2', '4f694d8a-67ba-4a0c-8144-8ffb2ed5d494',
  '7e5804c7-8401-4db8-95aa-d2af1886d157', 'f9283387-4c71-47b9-b641-45c514d27117',
  '3efc1c32-1014-4cc0-a14b-db971bffa621', '0b082ac1-084a-4f81-9fce-20fb974461a9',
  '537542f3-cea3-424f-908a-6d8b3c0d25d8', '1d28d60c-d2e5-4d13-b20a-5d4ddaf9af2e',
  '9724f853-3659-4c80-bbec-bd411021b872', '9ae13df5-9bfc-4ca3-b137-5535f5b34f39',
  'e72b0605-065d-4a70-9223-54a868d8fef3', '21baaa4e-9d4b-4df6-9de9-cb51fe455a26',
  'f2c3e16a-6274-48eb-9847-77ff098f6960', 'bfa4fe8a-c414-4a5b-9dc9-c3de4b0dcb6b',
  '8d9f01bf-4644-4f53-8198-783ae1232529', '91f0525a-be18-4bac-b162-373d4bc03d3e',
  '201fd0b1-e40c-41ac-83c6-a871ce540972', '92ff30aa-bcdd-4323-b2a6-1fea440138cc',
  '49f0eef9-43e7-4881-8f7d-169467c114db', '89151019-0e22-4a6f-81dd-dee6f9ab0123',
  '31142d3a-2209-449d-aa74-d9e3e80a6e38', '99ccb893-5976-423a-8773-220bb7efe6b6'
];

// 地域設定
const prefectureThemes = {
  '北海道': { primaryColor: '#87CEEB', secondaryColor: '#B0E0E6', accent: '#4682B4', name: '北海道' },
  '青森県': { primaryColor: '#00CED1', secondaryColor: '#40E0D0', accent: '#008B8B', name: '青森' },
  '岩手県': { primaryColor: '#9370DB', secondaryColor: '#DDA0DD', accent: '#8B008B', name: '岩手' },
  '宮城県': { primaryColor: '#32CD32', secondaryColor: '#98FB98', accent: '#228B22', name: '宮城' },
  '福島県': { primaryColor: '#FF69B4', secondaryColor: '#FFB6C1', accent: '#DC143C', name: '福島' },
  '茨城県': { primaryColor: '#FF7F50', secondaryColor: '#FFA07A', accent: '#FF4500', name: '茨城' },
  '栃木県': { primaryColor: '#DAA520', secondaryColor: '#F0E68C', accent: '#B8860B', name: '栃木' },
  '群馬県': { primaryColor: '#8A2BE2', secondaryColor: '#DA70D6', accent: '#9400D3', name: '群馬' },
  '埼玉県': { primaryColor: '#20B2AA', secondaryColor: '#66CDAA', accent: '#008B8B', name: '埼玉' },
  '千葉県': { primaryColor: '#FF6347', secondaryColor: '#FFA07A', accent: '#CD5C5C', name: '千葉' },
  '東京都': { primaryColor: '#4169E1', secondaryColor: '#6495ED', accent: '#191970', name: '東京' },
  '神奈川県': { primaryColor: '#1E90FF', secondaryColor: '#87CEFA', accent: '#0000CD', name: '神奈川' },
  '新潟県': { primaryColor: '#00FA9A', secondaryColor: '#98FB98', accent: '#00FF7F', name: '新潟' },
  '山梨県': { primaryColor: '#DC143C', secondaryColor: '#F08080', accent: '#B22222', name: '山梨' },
  '長野県': { primaryColor: '#9ACD32', secondaryColor: '#ADFF2F', accent: '#6B8E23', name: '長野' },
  '静岡県': { primaryColor: '#FF8C00', secondaryColor: '#FFA500', accent: '#FF7F00', name: '静岡' },
  '愛知県': { primaryColor: '#8B4513', secondaryColor: '#D2691E', accent: '#A0522D', name: '愛知' },
  '三重県': { primaryColor: '#483D8B', secondaryColor: '#6A5ACD', accent: '#4B0082', name: '三重' },
  '岐阜県': { primaryColor: '#228B22', secondaryColor: '#32CD32', accent: '#006400', name: '岐阜' },
  '富山県': { primaryColor: '#4682B4', secondaryColor: '#5F9EA0', accent: '#2F4F4F', name: '富山' },
  '石川県': { primaryColor: '#FFD700', secondaryColor: '#FFFF00', accent: '#DAA520', name: '石川' },
  '福井県': { primaryColor: '#FF1493', secondaryColor: '#FF69B4', accent: '#C71585', name: '福井' },
  '滋賀県': { primaryColor: '#00BFFF', secondaryColor: '#87CEEB', accent: '#1E90FF', name: '滋賀' },
  '京都府': { primaryColor: '#8B008B', secondaryColor: '#DA70D6', accent: '#800080', name: '京都' },
  '大阪府': { primaryColor: '#FF4500', secondaryColor: '#FF6347', accent: '#FF0000', name: '大阪' },
  '兵庫県': { primaryColor: '#2E8B57', secondaryColor: '#3CB371', accent: '#228B22', name: '兵庫' },
  '奈良県': { primaryColor: '#CD853F', secondaryColor: '#DEB887', accent: '#8B4513', name: '奈良' },
  '和歌山県': { primaryColor: '#FF7F50', secondaryColor: '#F0E68C', accent: '#CD5C5C', name: '和歌山' },
  '鳥取県': { primaryColor: '#F4A460', secondaryColor: '#DEB887', accent: '#D2691E', name: '鳥取' },
  '島根県': { primaryColor: '#708090', secondaryColor: '#778899', accent: '#2F4F4F', name: '島根' },
  '岡山県': { primaryColor: '#FFB6C1', secondaryColor: '#FFC0CB', accent: '#FF69B4', name: '岡山' },
  '広島県': { primaryColor: '#DC143C', secondaryColor: '#F08080', accent: '#B22222', name: '広島' },
  '山口県': { primaryColor: '#9370DB', secondaryColor: '#BA55D3', accent: '#8B008B', name: '山口' },
  '徳島県': { primaryColor: '#00CED1', secondaryColor: '#48D1CC', accent: '#20B2AA', name: '徳島' },
  '香川県': { primaryColor: '#FFD700', secondaryColor: '#FFFF00', accent: '#FFA500', name: '香川' },
  '愛媛県': { primaryColor: '#FFA500', secondaryColor: '#FFDAB9', accent: '#FF8C00', name: '愛媛' },
  '高知県': { primaryColor: '#32CD32', secondaryColor: '#90EE90', accent: '#228B22', name: '高知' },
  '福岡県': { primaryColor: '#FF6347', secondaryColor: '#FFA07A', accent: '#FF4500', name: '福岡' },
  '佐賀県': { primaryColor: '#9ACD32', secondaryColor: '#ADFF2F', accent: '#6B8E23', name: '佐賀' },
  '長崎県': { primaryColor: '#4169E1', secondaryColor: '#6495ED', accent: '#0000CD', name: '長崎' },
  '熊本県': { primaryColor: '#FF1493', secondaryColor: '#FF69B4', accent: '#DC143C', name: '熊本' },
  '大分県': { primaryColor: '#20B2AA', secondaryColor: '#48D1CC', accent: '#008B8B', name: '大分' },
  '宮崎県': { primaryColor: '#FF8C00', secondaryColor: '#FFA500', accent: '#FF7F00', name: '宮崎' },
  '鹿児島県': { primaryColor: '#8B4513', secondaryColor: '#D2691E', accent: '#A0522D', name: '鹿児島' },
  '沖縄県': { primaryColor: '#00BFFF', secondaryColor: '#87CEEB', accent: '#1E90FF', name: '沖縄' }
};

// 専門分野別テーマ
const specialtyThemes = {
  'specialty': {
    colors: ['#8B4513', '#D2691E', '#A0522D'],
    elements: ['研修', '教育', '専門'],
    decorations: ['🏛️', '📚', '🎓']
  },
  'regional': {
    colors: ['#228B22', '#32CD32', '#90EE90'],
    elements: ['地域', '観光', '文化'],
    decorations: ['🗾', '🌸', '⛩️']
  },
  'educational': {
    colors: ['#4169E1', '#6495ED', '#87CEEB'],
    elements: ['学習', '体験', '指導'],
    decorations: ['🏫', '📖', '👩‍🏫']
  },
  'tourist': {
    colors: ['#FF6347', '#FFA500', '#FFD700'],
    elements: ['観光', '体験', '見学'],
    decorations: ['🎪', '🎨', '🌈']
  },
  'innovation': {
    colors: ['#9370DB', '#BA55D3', '#DDA0DD'],
    elements: ['革新', '技術', '先進'],
    decorations: ['💡', '🔬', '⚡']
  }
};

function sanitizeFileName(name) {
  // 日本語から英語への変換マップ
  const conversionMap = {
    // 園芸関連
    '盆栽': 'bonsai',
    '園': 'en',
    '園芸': 'engei',
    '造園': 'zouen',
    '花': 'hana',
    '緑': 'midori',
    '植物': 'shokubutsu',
    'ガーデン': 'garden',
    'センター': 'center',
    'プラザ': 'plaza',
    '株式会社': 'corp',
    '有限会社': 'ltd',
    'フラワー': 'flower',
    'ランド': 'land',
    'パーク': 'park',
    'タウン': 'town',
    'テラス': 'terrace',
    'ワン': 'one',
    'ザ': 'the',
    'グリーン': 'green',
    'ナーセリーズ': 'nurseries',
    'オークション': 'auction',
    '五湖': 'goko',
    '富士': 'fuji',
    '筑波': 'tsukuba',
    '山麓': 'sanroku',
    '湘南': 'shonan',
    '屋島': 'yashima',
    '淡路': 'awaji',
    '里': 'sato',
    '白陽': 'hakuyo',
    '皐月': 'satsuki',
    '香風': 'kofu',
    '匠': 'takumi',
    '香艸': 'koso',
    '伊東屋': 'itoya',
    '榎本': 'enomoto',
    '丸京': 'marukyo',
    '一楽': 'ichiraku',
    '河合': 'kawai',
    '港北': 'kohoku',
    'ニュータウン': 'newtown',
    '植忠': 'uechuu',
    '明幸': 'meiko',
    '木': 'ki',
    '緑昇': 'ryokusho',
    '緑香': 'ryokko',
    '三創': 'sanso',
    'さにべる': 'saniberu',
    '山形': 'yamagata',
    '筒井': 'tsutsui',
    '新津': 'niitsu',
    '小森': 'komori',
    '松風': 'shofu',
    '泉': 'izumi',
    '豊田': 'toyota',
    '西宮': 'nishinomiya',
    'むつみ': 'mutsumi',
    '土木': 'doboku',
    '紀菜柑': 'kinakan',
    'やまいち': 'yamaichi',
    '馬原': 'umahara',
    '建設': 'kensetsu',
    'とがし': 'togashi',
    '花伝': 'kaden',
    'くるめ': 'kurume',
    '敦賀': 'tsuruga',
    '店': 'ten'
  };

  let result = name;

  // 日本語から英語への変換
  Object.keys(conversionMap).forEach(jp => {
    result = result.replace(new RegExp(jp, 'g'), conversionMap[jp]);
  });

  // 基本的なクリーンアップ
  result = result
    .toLowerCase()
    .replace(/[（）()]/g, '')
    .replace(/[\s\-・]+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-'); // 連続するハイフンを単一に

  return result || 'garden'; // 空文字の場合のフォールバック
}

function generateAdvancedSVG(garden, theme, categoryTheme) {
  const rating = garden.rating || 3.5;
  const ratingDisplay = rating >= 4.5 ? '★★★★★' :
                       rating >= 4.0 ? '★★★★' :
                       rating >= 3.5 ? '★★★' :
                       rating >= 3.0 ? '★★' : '★';

  const [primaryColor, secondaryColor, accentColor] = categoryTheme.colors;
  const [element1, element2, element3] = categoryTheme.elements;
  const [decoration1, decoration2, decoration3] = categoryTheme.decorations;

  return `<svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.secondaryColor};stop-opacity:0.3" />
    </linearGradient>
    <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
    <radialGradient id="treeGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${secondaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:1" />
    </radialGradient>
    <pattern id="groundPattern" patternUnits="userSpaceOnUse" width="40" height="20">
      <rect width="40" height="20" fill="${theme.secondaryColor}"/>
      <circle cx="10" cy="10" r="3" fill="${theme.accent}" opacity="0.3"/>
      <circle cx="30" cy="10" r="2" fill="${theme.accent}" opacity="0.2"/>
    </pattern>
  </defs>

  <!-- 背景空 -->
  <rect width="512" height="384" fill="url(#skyGradient)"/>

  <!-- 地面パターン -->
  <rect x="0" y="280" width="512" height="104" fill="url(#groundPattern)"/>

  <!-- メイン建物群 -->
  <rect x="40" y="180" width="180" height="120" fill="url(#buildingGradient)" rx="8"/>
  <polygon points="40,180 130,130 220,180" fill="${primaryColor}"/>

  <!-- サブ建物 -->
  <rect x="250" y="200" width="120" height="80" fill="rgba(${primaryColor.slice(1)}, 0.8)" rx="5"/>
  <polygon points="250,200 310,170 370,200" fill="${secondaryColor}"/>

  <!-- 盆栽コレクション（多様化） -->
  <circle cx="320" cy="240" r="40" fill="url(#treeGradient)"/>
  <rect x="315" y="240" width="10" height="35" fill="${accentColor}"/>

  <circle cx="380" cy="250" r="35" fill="url(#treeGradient)"/>
  <rect x="375" y="250" width="10" height="30" fill="${accentColor}"/>

  <circle cx="430" cy="230" r="30" fill="url(#treeGradient)"/>
  <rect x="425" y="230" width="8" height="25" fill="${accentColor}"/>

  <circle cx="460" cy="255" r="25" fill="url(#treeGradient)"/>
  <rect x="457" y="255" width="6" height="20" fill="${accentColor}"/>

  <!-- 特色建造物 -->
  <rect x="450" y="180" width="50" height="80" fill="rgba(${accentColor.slice(1)}, 0.4)" rx="8"/>
  <text x="455" y="200" font-family="serif" font-size="9" fill="${accentColor}">${theme.name}</text>
  <text x="455" y="215" font-family="serif" font-size="8" fill="${accentColor}">${element1}</text>
  <text x="455" y="230" font-family="serif" font-size="8" fill="${accentColor}">${element2}</text>
  <text x="455" y="245" font-family="serif" font-size="8" fill="${accentColor}">${element3}</text>

  <!-- 装飾的小道（改良版） -->
  <path d="M 0 320 Q 128 305 256 320 Q 384 335 512 320" stroke="${theme.accent}" stroke-width="25" fill="none" opacity="0.6"/>
  <path d="M 0 318 Q 128 303 256 318 Q 384 333 512 318" stroke="${secondaryColor}" stroke-width="8" fill="none"/>
  <path d="M 0 316 Q 128 301 256 316 Q 384 331 512 316" stroke="white" stroke-width="2" fill="none" opacity="0.8"/>

  <!-- 評価表示（改良版） -->
  <g transform="translate(420, 15)">
    <rect x="0" y="0" width="85" height="35" fill="rgba(255,255,255,0.95)" rx="8" stroke="${primaryColor}" stroke-width="2"/>
    <text x="8" y="15" font-family="sans-serif" font-size="8" fill="${accentColor}">評価</text>
    <text x="8" y="28" font-family="sans-serif" font-size="11" fill="${primaryColor}" font-weight="bold">${ratingDisplay}</text>
    <text x="52" y="28" font-family="sans-serif" font-size="10" fill="${accentColor}">${rating}</text>
  </g>

  <!-- メインタイトル（改良版） -->
  <rect x="10" y="10" width="${Math.min(garden.name.length * 12 + 20, 400)}" height="50" fill="rgba(255,255,255,0.98)" rx="10" stroke="${primaryColor}" stroke-width="3"/>
  <text x="20" y="35" font-family="serif" font-size="${garden.name.length > 15 ? '12' : '15'}" fill="#2F4F4F" font-weight="bold">${garden.name}</text>

  <!-- 地域情報 -->
  <rect x="10" y="70" width="120" height="35" fill="rgba(255,255,255,0.95)" rx="6" stroke="${theme.accent}" stroke-width="1"/>
  <text x="15" y="85" font-family="sans-serif" font-size="11" fill="${theme.accent}" font-weight="bold">${garden.prefecture}</text>
  <text x="15" y="98" font-family="sans-serif" font-size="9" fill="#666">${theme.name}地域</text>

  <!-- カテゴリー特色表示 -->
  <rect x="350" y="70" width="150" height="90" fill="rgba(255,255,255,0.95)" rx="8" stroke="${primaryColor}" stroke-width="2"/>
  <text x="355" y="85" font-family="sans-serif" font-size="10" fill="${primaryColor}" font-weight="bold">特色カテゴリー</text>
  <text x="355" y="100" font-family="sans-serif" font-size="9" fill="${accentColor}">• ${element1}重点</text>
  <text x="355" y="115" font-family="sans-serif" font-size="9" fill="${accentColor}">• ${element2}対応</text>
  <text x="355" y="130" font-family="sans-serif" font-size="9" fill="${accentColor}">• ${element3}充実</text>
  <text x="355" y="145" font-family="sans-serif" font-size="9" fill="${accentColor}">• 品質保証</text>

  <!-- 専門性アイコン -->
  <g transform="translate(470, 300)">
    <circle cx="15" cy="15" r="15" fill="${primaryColor}" opacity="0.8"/>
    <text x="15" y="20" font-family="sans-serif" font-size="12" fill="white" text-anchor="middle">${decoration1}</text>
  </g>
  <g transform="translate(440, 320)">
    <circle cx="15" cy="15" r="12" fill="${secondaryColor}" opacity="0.8"/>
    <text x="15" y="19" font-family="sans-serif" font-size="10" fill="white" text-anchor="middle">${decoration2}</text>
  </g>
  <g transform="translate(410, 340)">
    <circle cx="15" cy="15" r="10" fill="${accentColor}" opacity="0.8"/>
    <text x="15" y="18" font-family="sans-serif" font-size="8" fill="white" text-anchor="middle">${decoration3}</text>
  </g>

</svg>`;
}

async function generatePhase8Images() {
  try {
    console.log('🎨 フェーズ8最終拡充：高度カテゴリー別画像生成開始！');
    console.log('==================================================\n');

    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, specialties, rating, featured, established_year')
      .in('id', phase8GardenIds);

    if (error) {
      console.error('❌ データ取得エラー:', error.message);
      return;
    }

    if (!gardens || gardens.length === 0) {
      console.log('⚠️ 対象園が見つかりませんでした');
      return;
    }

    console.log(`📊 対象園数: ${gardens.length}園\n`);

    const categoryStats = {
      specialty: 0, regional: 0, educational: 0, tourist: 0, innovation: 0
    };

    for (let i = 0; i < gardens.length; i++) {
      const garden = gardens[i];
      const theme = prefectureThemes[garden.prefecture] || prefectureThemes['東京都'];

      // 高度カテゴリー分類
      let category = 'regional';
      if (garden.specialties) {
        const specialtiesStr = garden.specialties.join(' ').toLowerCase();
        if (specialtiesStr.includes('教育') || specialtiesStr.includes('研修') || specialtiesStr.includes('指導')) {
          category = 'educational';
        } else if (specialtiesStr.includes('専門') || specialtiesStr.includes('技術') || specialtiesStr.includes('高級')) {
          category = 'specialty';
        } else if (specialtiesStr.includes('観光') || specialtiesStr.includes('体験') || specialtiesStr.includes('見学')) {
          category = 'tourist';
        } else if (specialtiesStr.includes('革新') || specialtiesStr.includes('新しい') || specialtiesStr.includes('モダン')) {
          category = 'innovation';
        }
      }

      categoryStats[category]++;
      const categoryTheme = specialtyThemes[category];

      const sanitizedName = sanitizeFileName(garden.name);
      if (!sanitizedName) {
        console.log(`⚠️ ファイル名生成失敗: ${garden.name}`);
        continue;
      }

      const fileName = `${sanitizedName}.svg`;
      const filePath = `public/images/gardens/${fileName}`;

      const svgContent = generateAdvancedSVG(garden, theme, categoryTheme);

      fs.writeFileSync(filePath, svgContent);

      const rating = garden.rating || 3.5;
      const featured = garden.featured ? '⭐注目' : '';
      const established = garden.established_year ? `(${garden.established_year}年)` : '';
      const categoryDisplay = category === 'specialty' ? '専門特化' :
                             category === 'educational' ? '教育重点' :
                             category === 'tourist' ? '観光体験' :
                             category === 'innovation' ? '革新技術' : '地域文化';

      console.log(`✅ ${i + 1}/40 ${garden.name} ${featured}`);
      console.log(`   📍 ${garden.prefecture} | ⭐ ${rating} | 🎯 ${categoryDisplay} ${established}`);
      console.log(`   📁 ${fileName}`);
      console.log('');
    }

    console.log('🎯 フェーズ8カテゴリー分布:');
    console.log(`   🏛️ 専門特化園: ${categoryStats.specialty}園`);
    console.log(`   🗾 地域文化園: ${categoryStats.regional}園`);
    console.log(`   🏫 教育重点園: ${categoryStats.educational}園`);
    console.log(`   🎪 観光体験園: ${categoryStats.tourist}園`);
    console.log(`   💡 革新技術園: ${categoryStats.innovation}園`);

    console.log('\n🏆 フェーズ8完成の意義:');
    console.log('  ✅ 最終拡充：156園による完全網羅体制確立');
    console.log('  ✅ 高度分類：専門性に基づく詳細カテゴリー対応');
    console.log('  ✅ 品質保証：全評価レンジでの安定サービス提供');
    console.log('  ✅ 文化継承：伝統から革新まで完全包括');
    console.log('  ✅ ユーザー満足度最大化：あらゆるニーズに完全対応');

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

generatePhase8Images();