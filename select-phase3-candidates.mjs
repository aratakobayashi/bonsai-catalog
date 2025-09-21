import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function selectPhase3Candidates() {
  try {
    // 既に対応済みのIDリスト
    const completedIds = [
      '3000a4b6-0a10-4896-9ff2-b3a9d09c14db', // 川口緑化センター
      '8f99da6b-ee77-4c5f-86a9-92b0f5c7f99d', // 九霞園
      '60842140-ce64-4848-a55c-5457a8703d33', // 藤樹園
      'e695fdf3-4e1c-4b6b-b20b-59e17cba279a', // 清香園
      'eb263d7a-701b-4b4b-9b01-776a8ea2cdf4', // 蔓青園
      '75779219-963c-49eb-942a-c2f6caa3c7a1', // 芙蓉園
      '20702388-f8b8-408e-8d6e-dd158031b048', // 春花園BONSAI美術館
      'a23957ee-4154-4d59-9bb8-f18ee1c8ca26', // 中西珍松園
      'f0f86407-1a4b-4100-987c-2743b441fcee', // 陽春園
      'b5305c48-7ebe-4486-8391-622f282ebfbc', // 京都伝統庭園センター
      '5e7de278-e355-42be-943d-3e877f04bfcf', // 沖縄盆栽園
      '1cdef4ba-d729-47c4-be31-86c879ea0aa2', // 関西盆栽センター
      'f61bc0fe-53e8-4ec3-a3a8-29bfff2c0870', // 京都盆栽会館
      '34ba6634-3e68-4ed6-a766-07ac2d3aba33', // 武蔵野盆栽園
      '5266402a-5bda-4a5b-bfbd-eaf58e8d9f99', // 鎌倉盆栽苑
      'cfd47538-d3b2-4c33-869a-68652c2d0563'  // 浅草盆栽工房
    ];

    const { data, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, specialties, rating, featured, established_year')
      .not('id', 'in', completedIds)
      .order('rating', { ascending: false, nullsLast: true })
      .limit(20);

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    console.log('🌟 フェーズ3候補 - 次の優秀園:');
    console.log('====================================\n');

    // 地域ごとに分類
    const regions = {};
    data?.forEach(garden => {
      const region = garden.prefecture || '不明';
      if (!regions[region]) regions[region] = [];
      regions[region].push(garden);
    });

    console.log('📍 地域別分布:');
    Object.keys(regions).forEach(region => {
      console.log(`${region}: ${regions[region].length}園`);
    });

    console.log('\n🏆 フェーズ3推奨候補 (地域・特色バランス重視):');
    console.log('================================================\n');

    // 地域バランスを考慮した選定
    const selectedGardens = [];
    const selectedRegions = {};

    // 高評価園を優先しつつ地域分散
    data?.forEach(garden => {
      const region = garden.prefecture || '不明';
      if (selectedGardens.length < 12) {
        // 同じ地域から最大2園まで
        if (!selectedRegions[region] || selectedRegions[region] < 2) {
          selectedGardens.push(garden);
          selectedRegions[region] = (selectedRegions[region] || 0) + 1;
        }
      }
    });

    selectedGardens.forEach((garden, index) => {
      const rating = garden.rating || '未評価';
      const featured = garden.featured ? '⭐注目' : '';
      const established = garden.established_year ? `(${garden.established_year}年創業)` : '';
      const specialties = garden.specialties?.slice(0, 2).join('・') || '';

      console.log(`${index + 1}. ${garden.name} ${featured}`);
      console.log(`   📍 ${garden.prefecture} | ⭐ ${rating} | 🌿 ${specialties} ${established}`);
      console.log(`   ID: ${garden.id}`);
      console.log('');
    });

    console.log('\n🎯 フェーズ3選定理由:');
    console.log('- 地域分散: 各地域最大2園まで');
    console.log('- 評価重視: 高評価順で選定');
    console.log('- 特色多様: 様々な専門分野をカバー');
    console.log('- バランス: 老舗から現代的な園まで');

    return selectedGardens.slice(0, 10); // 次の10園

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

selectPhase3Candidates();