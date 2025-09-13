// Execute Phase 13 migration for Kanto plant nursery centers
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executePhase13Migration() {
  try {
    console.log('📁 Reading Phase 13 SQL file...');
    const sql = fs.readFileSync('supabase/migrations/016_insert_phase13_kanto_plant_nursery_centers.sql', 'utf8');
    console.log('✅ SQL file loaded');

    // Split the SQL into individual INSERT statements
    const lines = sql.split('\n');
    let currentRecord = null;
    let inRecord = false;
    let recordData = {};
    let fieldIndex = 0;
    let insertedCount = 0;

    // Define the field order based on the SQL INSERT statement
    const fieldOrder = [
      'id', 'name', 'address', 'description', 'image_url', 'website_url', 'phone',
      'prefecture', 'city', 'postal_code', 'latitude', 'longitude',
      'business_hours', 'closed_days', 'specialties', 'established_year',
      'owner_name', 'owner_message', 'access_info', 'parking_info',
      'experience_programs', 'online_sales', 'rating', 'review_count', 'featured',
      'additional_images', 'social_instagram'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('(') && !inRecord) {
        // Start of a new record
        inRecord = true;
        fieldIndex = 0;
        recordData = {};
        console.log('📝 Starting new record...');
      }
      
      if (inRecord) {
        // Extract values from each line
        if (line.includes('gen_random_uuid()')) {
          // Skip UUID field
          fieldIndex++;
        } else if (line.includes("'") || line.match(/^\s*\d+(\.\d+)?\s*,?\s*$/) || line.match(/^\s*(true|false|null)\s*,?\s*$/)) {
          // Extract value
          let value = line.replace(/,$/, '').trim();
          
          if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          } else if (value.endsWith("'::jsonb")) {
            value = JSON.parse(value.replace("'::jsonb", "").slice(1, -1));
          } else if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          } else if (value === 'null') {
            value = null;
          } else if (!isNaN(value) && value !== '') {
            value = parseFloat(value);
          }
          
          if (fieldIndex < fieldOrder.length) {
            recordData[fieldOrder[fieldIndex]] = value;
            fieldIndex++;
          }
        }
        
        if (line.includes('),') || (line.includes(');') && !line.includes('VALUES'))) {
          // End of record
          inRecord = false;
          
          // Insert the record
          if (recordData.name) {
            try {
              // Clean up the data for insertion
              const cleanData = {
                name: recordData.name,
                address: recordData.address,
                description: recordData.description,
                image_url: recordData.image_url,
                website_url: recordData.website_url,
                phone: recordData.phone,
                prefecture: recordData.prefecture,
                city: recordData.city,
                postal_code: recordData.postal_code,
                latitude: recordData.latitude,
                longitude: recordData.longitude,
                business_hours: recordData.business_hours,
                closed_days: recordData.closed_days,
                specialties: recordData.specialties,
                established_year: recordData.established_year,
                owner_name: recordData.owner_name,
                owner_message: recordData.owner_message,
                access_info: recordData.access_info,
                parking_info: recordData.parking_info,
                experience_programs: recordData.experience_programs,
                online_sales: recordData.online_sales,
                rating: recordData.rating,
                review_count: recordData.review_count,
                featured: recordData.featured,
                additional_images: recordData.additional_images,
                social_instagram: recordData.social_instagram
              };

              const { error } = await supabase
                .from('gardens')
                .insert(cleanData);

              if (error) {
                console.error(`❌ Error inserting ${cleanData.name}:`, error.message);
              } else {
                insertedCount++;
                console.log(`✅ Inserted: ${cleanData.name}`);
              }
            } catch (insertError) {
              console.error('❌ Error inserting record:', insertError.message);
            }
          }
        }
      }
    }

    console.log(`\n🎉 Phase 13 migration completed!`);
    console.log(`✅ Successfully inserted ${insertedCount} gardens`);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

executePhase13Migration();