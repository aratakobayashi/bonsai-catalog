-- Extend gardens table with additional information
-- Migration: 002_extend_gardens_table.sql

-- Add new columns to gardens table
ALTER TABLE gardens 
ADD COLUMN prefecture VARCHAR(50),                    -- 都道府県
ADD COLUMN city VARCHAR(100),                         -- 市区町村
ADD COLUMN postal_code VARCHAR(10),                   -- 郵便番号
ADD COLUMN latitude DECIMAL(10, 8),                   -- 緯度
ADD COLUMN longitude DECIMAL(11, 8),                  -- 経度
ADD COLUMN business_hours TEXT,                       -- 営業時間
ADD COLUMN closed_days JSONB DEFAULT '[]'::jsonb,    -- 定休日（配列）
ADD COLUMN specialties JSONB DEFAULT '[]'::jsonb,    -- 専門分野（配列）
ADD COLUMN established_year INTEGER,                  -- 創業年
ADD COLUMN owner_name VARCHAR(100),                   -- 園主名
ADD COLUMN owner_message TEXT,                        -- 園主からのメッセージ
ADD COLUMN access_info TEXT,                          -- アクセス情報
ADD COLUMN parking_info VARCHAR(255),                 -- 駐車場情報
ADD COLUMN experience_programs BOOLEAN DEFAULT false, -- 体験教室の有無
ADD COLUMN online_sales BOOLEAN DEFAULT false,        -- オンライン販売対応
ADD COLUMN rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5), -- 評価（0-5）
ADD COLUMN review_count INTEGER DEFAULT 0,            -- レビュー数
ADD COLUMN featured BOOLEAN DEFAULT false,            -- 注目園フラグ
ADD COLUMN additional_images JSONB DEFAULT '[]'::jsonb, -- 追加画像（配列）
ADD COLUMN social_instagram VARCHAR(255),             -- Instagram URL
ADD COLUMN social_twitter VARCHAR(255),               -- Twitter URL
ADD COLUMN social_facebook VARCHAR(255);              -- Facebook URL

-- Create indexes for better query performance
CREATE INDEX idx_gardens_prefecture ON gardens(prefecture);
CREATE INDEX idx_gardens_city ON gardens(city);
CREATE INDEX idx_gardens_specialties ON gardens USING GIN(specialties);
CREATE INDEX idx_gardens_featured ON gardens(featured);
CREATE INDEX idx_gardens_rating ON gardens(rating);
CREATE INDEX idx_gardens_location ON gardens(latitude, longitude); -- For geographic queries

-- Create full-text search indexes for Japanese content
CREATE INDEX idx_gardens_name_search ON gardens USING GIN(to_tsvector('japanese', name));
CREATE INDEX idx_gardens_description_search ON gardens USING GIN(to_tsvector('japanese', description));
CREATE INDEX idx_gardens_owner_message_search ON gardens USING GIN(to_tsvector('japanese', owner_message));

-- Add check constraints
ALTER TABLE gardens ADD CONSTRAINT check_established_year 
    CHECK (established_year IS NULL OR (established_year >= 1600 AND established_year <= EXTRACT(YEAR FROM CURRENT_DATE)));
    
ALTER TABLE gardens ADD CONSTRAINT check_review_count 
    CHECK (review_count >= 0);

-- Create a view for gardens with computed fields
CREATE OR REPLACE VIEW gardens_with_computed AS
SELECT 
    *,
    -- Compute average rating display
    CASE 
        WHEN rating IS NOT NULL THEN ROUND(rating, 1)
        ELSE NULL 
    END as display_rating,
    -- Compute age of garden
    CASE 
        WHEN established_year IS NOT NULL 
        THEN EXTRACT(YEAR FROM CURRENT_DATE) - established_year
        ELSE NULL 
    END as garden_age,
    -- Check if garden has complete contact info
    (phone IS NOT NULL AND website_url IS NOT NULL) as has_complete_contact
FROM gardens;

-- Grant permissions for the new view
GRANT SELECT ON gardens_with_computed TO anon;