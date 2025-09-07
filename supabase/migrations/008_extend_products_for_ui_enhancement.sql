-- Extend products table for UI enhancement
-- Migration: 008_extend_products_for_ui_enhancement.sql

-- Add new columns for enhanced UI
ALTER TABLE products ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 2; -- 1=簡単, 2=普通, 3=難しい
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm INTEGER; -- 高さ(cm)
ALTER TABLE products ADD COLUMN IF NOT EXISTS width_cm INTEGER; -- 幅(cm)
ALTER TABLE products ADD COLUMN IF NOT EXISTS pot_diameter_cm INTEGER; -- 鉢直径(cm)
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_frequency VARCHAR(50) DEFAULT 'weekly'; -- daily, weekly, monthly
ALTER TABLE products ADD COLUMN IF NOT EXISTS sunlight_requirement VARCHAR(50) DEFAULT 'partial_shade'; -- full_sun, partial_shade, shade
ALTER TABLE products ADD COLUMN IF NOT EXISTS watering_frequency VARCHAR(50) DEFAULT 'when_dry'; -- daily, when_dry, weekly
ALTER TABLE products ADD COLUMN IF NOT EXISTS bloom_months JSONB DEFAULT '[]'::jsonb; -- [3,4] for March-April
ALTER TABLE products ADD COLUMN IF NOT EXISTS foliage_months JSONB DEFAULT '[]'::jsonb; -- [10,11] for Oct-Nov
ALTER TABLE products ADD COLUMN IF NOT EXISTS indoor_suitable BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gift_suitable BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS beginner_friendly BOOLEAN DEFAULT true;

-- Create index for new search fields
CREATE INDEX IF NOT EXISTS idx_products_difficulty ON products(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_products_indoor ON products(indoor_suitable);
CREATE INDEX IF NOT EXISTS idx_products_beginner ON products(beginner_friendly);

-- Add comments for documentation
COMMENT ON COLUMN products.difficulty_level IS '育成難易度: 1=簡単, 2=普通, 3=難しい';
COMMENT ON COLUMN products.height_cm IS '商品の高さ(cm)';
COMMENT ON COLUMN products.width_cm IS '商品の幅(cm)';
COMMENT ON COLUMN products.pot_diameter_cm IS '鉢の直径(cm)';
COMMENT ON COLUMN products.care_frequency IS 'お手入れ頻度: daily, weekly, monthly';
COMMENT ON COLUMN products.sunlight_requirement IS '日照条件: full_sun, partial_shade, shade';
COMMENT ON COLUMN products.watering_frequency IS '水やり頻度: daily, when_dry, weekly';
COMMENT ON COLUMN products.bloom_months IS '開花月の配列 例: [3,4]';
COMMENT ON COLUMN products.foliage_months IS '紅葉月の配列 例: [10,11]';
COMMENT ON COLUMN products.indoor_suitable IS '室内栽培可能かどうか';
COMMENT ON COLUMN products.gift_suitable IS 'ギフトに適しているかどうか';
COMMENT ON COLUMN products.beginner_friendly IS '初心者向けかどうか';