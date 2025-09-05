-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for size categories
CREATE TYPE size_category AS ENUM ('mini', 'small', 'medium', 'large', 'unknown');

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0), -- Price in JPY
    category VARCHAR(100) NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    size_category size_category DEFAULT 'unknown',
    image_url TEXT,
    amazon_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create gardens table
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    description TEXT,
    image_url TEXT,
    website_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_size_category ON products(size_category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_name_search ON products USING GIN(to_tsvector('japanese', name));
CREATE INDEX idx_products_description_search ON products USING GIN(to_tsvector('japanese', description));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_products
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_gardens
    BEFORE UPDATE ON gardens
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Gardens are viewable by everyone" ON gardens
    FOR SELECT USING (true);

-- Grant permissions to anonymous users for read operations
GRANT SELECT ON products TO anon;
GRANT SELECT ON gardens TO anon;