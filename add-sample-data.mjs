// Add rich sample data to test new garden fields
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleData() {
  console.log('🌿 Adding rich sample data to test new schema...\n');

  // Update existing gardens with extended data
  const sampleUpdates = [
    {
      id: '01234567-89ab-cdef-0123-456789abcdef', // Assuming first garden ID
      prefecture: '東京都',
      city: '世田谷区',
      postal_code: '158-0081',
      latitude: 35.6063,
      longitude: 139.6538,
      business_hours: '9:00-17:00（土日祝日も営業）',
      closed_days: ['水曜日'],
      specialties: ['松柏類', '雑木類', '花もの', 'ミニ盆栽'],
      established_year: 1965,
      owner_name: '田中 一郎',
      owner_message: '50年以上の経験を活かし、初心者からベテランまで丁寧に指導いたします。',
      access_info: '東急田園都市線「駒沢大学駅」徒歩8分',
      parking_info: '専用駐車場3台完備',
      experience_programs: true,
      online_sales: true,
      rating: 4.5,
      review_count: 127,
      featured: true,
      additional_images: [
        'https://example.com/garden1-2.jpg',
        'https://example.com/garden1-3.jpg'
      ],
      social_instagram: 'https://instagram.com/tokyo_bonsai_garden'
    }
  ];

  // First, get existing garden IDs
  const { data: existingGardens, error: fetchError } = await supabase
    .from('gardens')
    .select('id, name')
    .limit(3);

  if (fetchError) {
    console.error('❌ Error fetching existing gardens:', fetchError.message);
    return;
  }

  console.log('📊 Found existing gardens:');
  existingGardens?.forEach((garden, index) => {
    console.log(`   ${index + 1}. ${garden.name} (${garden.id})`);
  });

  if (existingGardens && existingGardens.length > 0) {
    // Update first garden with rich data
    const firstGarden = existingGardens[0];
    console.log(`\n⚡ Updating "${firstGarden.name}" with extended data...`);

    const { data, error } = await supabase
      .from('gardens')
      .update({
        prefecture: '東京都',
        city: '世田谷区',
        postal_code: '158-0081',
        latitude: 35.6063,
        longitude: 139.6538,
        business_hours: '9:00-17:00（土日祝日も営業）',
        closed_days: ['水曜日'],
        specialties: ['松柏類', '雑木類', '花もの', 'ミニ盆栽'],
        established_year: 1965,
        owner_name: '田中 一郎',
        owner_message: '50年以上の経験を活かし、初心者からベテランまで丁寧に指導いたします。',
        access_info: '東急田園都市線「駒沢大学駅」徒歩8分',
        parking_info: '専用駐車場3台完備',
        experience_programs: true,
        online_sales: true,
        rating: 4.5,
        review_count: 127,
        featured: true,
        additional_images: [
          'https://example.com/garden1-2.jpg',
          'https://example.com/garden1-3.jpg'
        ],
        social_instagram: 'https://instagram.com/tokyo_bonsai_garden'
      })
      .eq('id', firstGarden.id);

    if (error) {
      console.error('❌ Error updating garden:', error.message);
    } else {
      console.log('✅ Successfully updated garden with rich data!');
    }

    // Verify the update
    console.log('\n🔍 Verifying updated data...');
    const { data: updated, error: verifyError } = await supabase
      .from('gardens')
      .select('name, prefecture, specialties, rating, owner_name')
      .eq('id', firstGarden.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message);
    } else {
      console.log('📊 Updated garden data:');
      console.log(`   Name: ${updated.name}`);
      console.log(`   Prefecture: ${updated.prefecture}`);
      console.log(`   Specialties: ${JSON.stringify(updated.specialties)}`);
      console.log(`   Rating: ${updated.rating}⭐`);
      console.log(`   Owner: ${updated.owner_name}`);
    }
  }
}

addSampleData();