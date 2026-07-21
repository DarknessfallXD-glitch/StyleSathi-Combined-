-- ============================================================
-- StyleSathi Supabase SQL Migration
 -- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Products table with vector embedding
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    price DECIMAL,
    currency TEXT DEFAULT 'NPR',
    image_url TEXT DEFAULT '',
    product_url TEXT DEFAULT '',
    source TEXT DEFAULT 'curated',
    location TEXT DEFAULT 'NP',
    embedding VECTOR(1024),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_products_embedding
    ON products
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- 4. Vector search function
CREATE OR REPLACE FUNCTION match_products(
    query_embedding VECTOR(1024),
    match_threshold FLOAT,
    match_count INT,
    filter_location TEXT DEFAULT 'NP',
    filter_category TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    price DECIMAL,
    currency TEXT,
    image_url TEXT,
    product_url TEXT,
    source TEXT,
    location TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.price,
        p.currency,
        p.image_url,
        p.product_url,
        p.source,
        p.location,
        1 - (p.embedding <=> query_embedding) AS similarity,
        p.metadata
    FROM products p
    WHERE
        1 - (p.embedding <=> query_embedding) > match_threshold
        AND p.location = filter_location
        AND (filter_category IS NULL OR p.category = filter_category)
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Try-on history table
CREATE TABLE IF NOT EXISTS tryon_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    result_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tryon_history_user_id ON tryon_history(user_id);

-- 6. Add daily_limit and user_usage columns if not exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_limit INT DEFAULT 20;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_usage INT DEFAULT 0;

-- 7. RLS policies for products (read-only for authenticated users)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

-- 8. RLS for tryon_history
ALTER TABLE tryon_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tryon history"
    ON tryon_history FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tryon history"
    ON tryon_history FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 9. Seed curated products (Nepali fashion)
INSERT INTO products (title, description, category, price, currency, image_url, product_url, source, location, metadata) VALUES
    ('Traditional Nepali Cotton Kurta', 'Handwoven cotton kurta with traditional Nepali patterns. Comfortable for daily wear.', 'Kurta', 1500, 'NPR', '', '', 'curated', 'NP', '{"brand": "Local Artisan", "tags": ["kurta", "cotton", "traditional"]}'),
    ('Pashmina Shawl - Pure Cashmere', 'Luxurious pure cashmere pashmina shawl handcrafted in the Himalayas.', 'Shawl', 4500, 'NPR', '', '', 'curated', 'NP', '{"brand": "Himalayan Pashmina", "tags": ["pashmina", "cashmere", "shawl"]}'),
    ('Dhaka Topi (Nepali Cap)', 'Traditional Nepali Dhaka topi handwoven with authentic patterns.', 'Accessories', 350, 'NPR', '', '', 'curated', 'NP', '{"brand": "Local Artisan", "tags": ["dhaka", "topi", "traditional"]}'),
    ('Hemp Yoga Pants', 'Eco-friendly hemp yoga pants made in Nepal. Sustainable and breathable.', 'Bottom', 2200, 'NPR', '', '', 'curated', 'NP', '{"brand": "EcoNepal", "tags": ["hemp", "yoga", "sustainable"]}'),
    ('Newari Gwa: Puja Dress', 'Traditional Newari gown for festivals and ceremonies. Rich red and gold embroidery.', 'Traditional', 3800, 'NPR', '', '', 'curated', 'NP', '{"brand": "Newari Heritage", "tags": ["newari", "festival", "traditional"]}'),
    ('Cashmere Blend Sweater', 'Warm cashmere blend sweater perfect for Kathmandu winters.', 'Top', 3200, 'NPR', '', '', 'curated', 'NP', '{"brand": "Himalayan Knits", "tags": ["sweater", "cashmere", "winter"]}'),
    ('Mandala Print Maxi Dress', 'Beautiful mandala print maxi dress, flowy and comfortable for any occasion.', 'Dress', 2800, 'NPR', '', '', 'curated', 'NP', '{"brand": "Boho Nepal", "tags": ["mandala", "dress", "maxi"]}'),
    ('Handmade Beaded Necklace', 'Authentic Nepali handmade beaded necklace with semi-precious stones.', 'Jewelry', 1200, 'NPR', '', '', 'curated', 'NP', '{"brand": "Local Artisan", "tags": ["beaded", "necklace", "handmade"]}'),
    ('Organic Cotton T-Shirt', 'Organic cotton t-shirt with sustainable production. Available in multiple colors.', 'Top', 900, 'NPR', '', '', 'curated', 'NP', '{"brand": "EcoNepal", "tags": ["organic", "cotton", "tshirt"]}'),
    ('Sari - Pure Silk Banarasi', 'Pure silk Banarasi sari with golden zari work. Imported from Varanasi.', 'Sari', 8500, 'NPR', '', '', 'curated', 'NP', '{"brand": "Silk Heritage", "tags": ["silk", "banarasi", "sari"]}')
ON CONFLICT DO NOTHING;
