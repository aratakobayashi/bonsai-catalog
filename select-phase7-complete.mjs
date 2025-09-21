import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function selectPhase7Complete() {
  try {
    // 既に対応済みのIDリスト（フェーズ1-6の全86園）
    const completedIds = new Set([
      // フェーズ1: 初期実装園（6園）
      '3000a4b6-0a10-4896-9ff2-b3a9d09c14db', '8f99da6b-ee77-4c5f-86a9-92b0f5c7f99d',
      '60842140-ce64-4848-a55c-5457a8703d33', 'e695fdf3-4e1c-4b6b-b20b-59e17cba279a',
      'eb263d7a-701b-4b4b-9b01-776a8ea2cdf4', '75779219-963c-49eb-942a-c2f6caa3c7a1',

      // フェーズ2: プレミアム園（10園）
      '20702388-f8b8-408e-8d6e-dd158031b048', 'a23957ee-4154-4d59-9bb8-f18ee1c8ca26',
      'f0f86407-1a4b-4100-987c-2743b441fcee', 'b5305c48-7ebe-4486-8391-622f282ebfbc',
      '5e7de278-e355-42be-943d-3e877f04bfcf', '1cdef4ba-d729-47c4-be31-86c879ea0aa2',
      'f61bc0fe-53e8-4ec3-a3a8-29bfff2c0870', '34ba6634-3e68-4ed6-a766-07ac2d3aba33',
      '5266402a-5bda-4a5b-bfbd-eaf58e8d9f99', 'cfd47538-d3b2-4c33-869a-68652c2d0563',

      // フェーズ3: 地域多様性（10園）
      '3c4f5845-c6f7-47e7-87d5-d68b5cafc0ae', 'd59a502e-61cb-427e-ac93-bb4da4dfc5f6',
      '253b3027-463f-4bd9-847e-90547715cb9b', '9a1819fd-05a1-4d66-9877-bc07607ba19a',
      '323ae2c8-82a0-480a-a0bf-3eeab52baa3a', 'aec3cb3b-ff22-476a-9728-b52547ab3a98',
      '40a5e7c5-8cb6-46ef-bd83-cb830d7da0cd', '929b849b-0b11-45b7-b5d8-9bf09cfd64d0',
      'b81646b0-261b-4e3b-b6f3-8ebfb2fb0cb9', '29a49dbc-e5e1-4201-afe9-0b4a09223095',

      // フェーズ4: 全国拡充（15園）
      '299bced1-91e7-424b-bdd3-6391ccc5c622', '34dd9a7c-45cd-467b-9650-dd919ef51373',
      '43bef990-75ae-431b-bcd9-3627879cf4eb', '96aa3db9-0ea0-4f13-9768-1c81f6ad3416',
      '97e7553f-109d-4631-939a-8d292eeb625b', 'f3418bb6-eef6-47a7-8c54-905ed1d6d3cb',
      'c461d493-c16b-4b45-9a26-e3e15624e3c4', '1f54a5e8-d50a-438f-aecd-67b9f2499903',
      'a38daf6e-445f-481b-a9a8-55ea631428e3', '7cb38263-35fd-4fdb-b0a5-9c31227d6ebc',
      '2a93e2ed-3bea-4855-b69c-9d5df4d0d1e3', '0a120c74-2bf1-4ca1-a16c-b34865967245',
      'd432d4bf-908e-4952-86c5-b8c5798a1225', '6897be01-8059-41b6-9749-436eebb5e678',
      '71d984be-89d6-427c-a27c-0139fbc3e889',

      // フェーズ5: 総合拡充（20園）
      'fe68bd0f-0a04-4c35-b721-ae89c2963247', '7163682f-97fd-4178-bf2f-f64683af32fc',
      'a45f1770-9d15-40c7-a9b3-332f9edc0530', '4557fb2e-7e5f-488e-8ef4-55b3a95dd60d',
      'd85b297c-528c-4861-8f7b-e07a6beef5d1', 'fc9f4072-151e-463f-8acc-e20935740398',
      '7d49d321-50a2-4729-b6bd-8f100dbc7e19', 'a7c48e64-0ab4-46ed-9e85-6d533364ba4f',
      '58e02c92-8918-4212-9560-c56e31606724', '5ec52f80-073d-45d0-aae2-b72f11672721',
      '1c839911-a0bb-40cd-9733-5945a1192270', 'c8ddaa61-7922-40b8-8133-7b1e0ab36e9c',
      'c5abd99b-808b-48fd-b5f2-8353385ac719', '77a2d6e0-8b2a-455e-af37-7d4cd89257c7',
      '1191e28b-15ef-4363-b43e-8ed007154b22', '29d8a441-bdd5-4fc5-8514-164ff37e3234',
      'c62357fb-f3de-4aa4-add5-eb1bb7f95922', 'b2974592-38df-4f4b-907b-e5fe1df60620',
      'd890f754-cf36-4724-bdd0-ee07b95b4a88', '9edd8075-1637-4f74-8f42-8b3f689785bc',

      // フェーズ6: 究極拡充（25園）
      'aa02f356-72e3-49dd-9511-fea249002fdf', 'f7d24f87-828d-40ab-a330-8c03b7879a28',
      '1da87f61-d5cc-456c-827b-8a2ef675b68a', '8d33d8ac-60a3-49e7-a7b8-4507cfaf0a13',
      '8a3ce3f8-8503-4dd7-beee-bbc4d45bf5d3', 'fa96de24-e49e-4dc6-a969-d7e81462a0d5',
      '639402ee-a9e5-459f-8772-463ab6413598', '588e5f53-2541-489d-b991-6b28375df649',
      '5825c02c-84a3-4a56-85fe-e816103aef06', 'e4ac72e0-8a4b-410e-9e99-d9f6778b7b9f',
      '9d395b67-bad0-44fe-87fb-7b4df3417307', '500e6ae7-92bd-4758-8550-a50ca2baaa60',
      '5f6ef2d7-6540-4a1c-9739-1dc48254fa8e', 'bc8f2e83-04cb-48a0-b213-75d1e6b09fee',
      '5f2057cb-4757-428f-befc-4af8e6bef25b', 'aaab7bde-68f9-4ccb-8e78-871ca5ee8fc5',
      '8c90b21d-54dd-4811-b5b7-1282f3fb1f25', '3cc5336e-28ba-4555-b834-351436bdbca0',
      '8ed687ca-0e7a-470a-9960-5dfa1592d088', '9a9dc214-6dd8-4d31-ba99-a2e475d302f8',
      '174b8907-df0e-492c-a93a-adf2bc868081', '78e25ed5-8a97-4a3e-9f3d-77fdd5054e8b',
      '6b9181e5-f2df-4c32-a2ad-5700ac7f866f', '63515450-e9f3-40f6-852d-b726e7ea7552',
      'a035baf6-e9e9-427c-8245-10e6d0c11435'
    ]);

    // 全データを取得してJavaScriptでフィルター
    const { data, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, specialties, rating, featured, established_year')
      .order('rating', { ascending: false, nullsLast: true });

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    // 未対応の園をフィルター
    const remainingGardens = data?.filter(garden => !completedIds.has(garden.id)) || [];

    console.log('🚀 フェーズ7完全制覇計画');
    console.log('========================\n');

    console.log(`📊 現在の対応状況:`);
    console.log(`   ✅ 対応済み: 86園`);
    console.log(`   📋 残り候補: ${remainingGardens.length}園\n`);

    // 完全制覇を目指す最終選定戦略
    const selectedGardens = [];
    const selectedRegions = {};
    const ratingTiers = {
      excellent: [], // 3.7以上
      good: [],      // 3.4-3.6
      solid: []      // 3.0-3.3
    };

    // 残り全園をバランス良く選定（30園目標）
    remainingGardens.forEach(garden => {
      const region = garden.prefecture || '不明';
      const rating = garden.rating || 0;

      if (selectedGardens.length < 30) {
        // 地域の多様性を重視（各地域から最大5園まで）
        const regionCount = selectedRegions[region] || 0;

        // 評価レベル別の分類
        let tierAssigned = false;

        if (rating >= 3.7 && ratingTiers.excellent.length < 15) {
          ratingTiers.excellent.push(garden);
          tierAssigned = true;
        } else if (rating >= 3.4 && rating < 3.7 && ratingTiers.good.length < 10) {
          ratingTiers.good.push(garden);
          tierAssigned = true;
        } else if (rating >= 3.0 && rating < 3.4 && ratingTiers.solid.length < 5) {
          ratingTiers.solid.push(garden);
          tierAssigned = true;
        }

        if (tierAssigned && regionCount < 5) {
          selectedGardens.push(garden);
          selectedRegions[region] = regionCount + 1;
        }
      }
    });

    console.log('🎯 フェーズ7推奨候補（完全制覇・30園）:');
    console.log('==========================================\n');

    selectedGardens.slice(0, 30).forEach((garden, index) => {
      const rating = garden.rating || '未評価';
      const featured = garden.featured ? '⭐注目' : '';
      const established = garden.established_year ? `(${garden.established_year}年創業)` : '';
      const specialties = garden.specialties?.slice(0, 3).join('・') || '';

      console.log(`${index + 1}. ${garden.name} ${featured}`);
      console.log(`   📍 ${garden.prefecture} | ⭐ ${rating} | 🌿 ${specialties} ${established}`);
      console.log(`   ID: ${garden.id}`);
      console.log('');
    });

    // 地域分散状況
    console.log('📍 フェーズ7新規開拓地域:');
    Object.keys(selectedRegions).forEach(region => {
      console.log(`   ${region}: ${selectedRegions[region]}園`);
    });

    // 評価分布
    console.log('\n📈 評価分布（最終バランス）:');
    console.log(`   🟢 優秀園 (3.7+): ${ratingTiers.excellent.length}園`);
    console.log(`   🟡 良質園 (3.4-3.6): ${ratingTiers.good.length}園`);
    console.log(`   🔵 堅実園 (3.0-3.3): ${ratingTiers.solid.length}園`);

    console.log('\n🏆 フェーズ7の意義:');
    console.log('  ✅ 完全制覇: 全国の盆栽園を網羅的にカバー');
    console.log('  ✅ 全評価レンジ対応: 超高評価から新興園まで');
    console.log('  ✅ 地域密度最大化: 各都道府県の代表園を充実');
    console.log('  ✅ ユーザー体験完成: あらゆるニーズに完全対応');
    console.log('  ✅ 盆栽文化継承: 伝統から革新まで全ての価値観を包括');

    return selectedGardens.slice(0, 30);

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

selectPhase7Complete();