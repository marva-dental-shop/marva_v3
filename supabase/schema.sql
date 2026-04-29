-- ============================================================
-- MARVA MINI APP – SUPABASE SQL (To'liq yangi schema)
-- SQL Editor ga copy-paste qiling va Run bosing
-- ============================================================

-- 1. ESKI JADVALLARNI O'CHIRISH
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 2. JADVALLARNI YARATISH
-- ============================================================

CREATE TABLE users (
  id                BIGSERIAL PRIMARY KEY,
  telegram_id       BIGINT UNIQUE,
  full_name         TEXT,
  phone             TEXT,
  address           TEXT,
  age               INTEGER,
  gender            TEXT,
  customer_type     TEXT,
  clinic_name       TEXT,
  telegram_username TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon        TEXT,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE products (
  id               BIGSERIAL PRIMARY KEY,
  category_id      BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE,
  description      TEXT,
  full_description TEXT,
  price            NUMERIC(12,2) NOT NULL DEFAULT 0,
  old_price        NUMERIC(12,2),
  image_url        TEXT,
  stock            INTEGER DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  is_featured      BOOLEAN DEFAULT FALSE,
  brand            TEXT,
  country          TEXT,
  article          TEXT,
  package_info     TEXT,
  usage_area       TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE orders (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT REFERENCES users(id) ON DELETE SET NULL,
  full_name        TEXT NOT NULL,
  phone            TEXT NOT NULL,
  address          TEXT,
  note             TEXT,
  total_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_status     TEXT DEFAULT 'Yangi',
  delivery_status  TEXT DEFAULT 'Dastavka biriktirilmagan',
  courier_name     TEXT,
  courier_phone    TEXT,
  pickup_point     TEXT,
  delivery_note    TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id   BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  quantity     INTEGER NOT NULL,
  price        NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

-- USERS
CREATE POLICY "users_insert" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "users_select" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "users_update" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- CATEGORIES
CREATE POLICY "categories_select" ON categories FOR SELECT TO anon USING (true);

-- PRODUCTS (anon faqat aktiv mahsulotlarni ko'radi)
CREATE POLICY "products_select_active" ON products FOR SELECT TO anon USING (is_active = true);
-- service_role (admin API) hammasi ko'radi va o'zgartiradi
CREATE POLICY "products_all_service" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ORDERS
CREATE POLICY "orders_insert" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "orders_select" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ORDER_ITEMS
CREATE POLICY "order_items_insert" ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "order_items_select" ON order_items FOR SELECT TO anon USING (true);

-- ============================================================
-- 5. SEED DATA
-- ============================================================
INSERT INTO categories (name, slug, icon, description) VALUES
  ('Plombalar',     'plombalar',     '🦷', 'Kompozit va flow materiallar'),
  ('Ortopedia',     'ortopedia',     '🧩', 'Ortopedik materiallar'),
  ('Instrumentlar', 'instrumentlar', '🛠️', 'Stomatologik instrumentlar'),
  ('Endodontiya',   'endodontiya',   '🧪', 'Kanal materiallari'),
  ('Bor',           'bor',           '⚙️', 'Bor va frezalar'),
  ('Kreslo',        'kreslo',        '💺', 'Dental unit va kreslolar')
ON CONFLICT (slug) DO NOTHING;

-- TAYYOR!
