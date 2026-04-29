-- supabase/seed.sql

insert into categories (name, slug, icon, description)
values
  ('Plombalar', 'plombalar', '🦷', 'Kompozit va flow materiallar'),
  ('Ortopedia', 'ortopedia', '🧩', 'Ortopedik materiallar'),
  ('Instrumentlar', 'instrumentlar', '🛠️', 'Stomatologik instrumentlar'),
  ('Endodontiya', 'endodontiya', '🧪', 'Kanal materiallari'),
  ('Bor', 'bor', '⚙️', 'Bor va frezalar'),
  ('Kreslo', 'kreslo', '💺', 'Dental unit va kreslolar')
on conflict (slug) do nothing;
