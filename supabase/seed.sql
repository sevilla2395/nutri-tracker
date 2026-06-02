-- =====================================================
-- NutriTracker - Seed Data
-- Run AFTER the migration SQL
-- Pre-populates food categories and ~50 global food exchanges
-- =====================================================

-- =====================================================
-- FOOD CATEGORIES
-- =====================================================
INSERT INTO public.food_categories (id, name, description, color_hex, icon, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Harinas',    'Cereales, panes, pastas y tubérculos',       '#F97316', '🌾', 1),
  ('00000000-0000-0000-0000-000000000002', 'Proteínas',  'Carnes, aves, pescados, huevos y legumbres', '#EF4444', '🥩', 2),
  ('00000000-0000-0000-0000-000000000003', 'Lácteos',    'Leche, yogur y quesos',                      '#3B82F6', '🥛', 3),
  ('00000000-0000-0000-0000-000000000004', 'Verduras',   'Vegetales bajos en almidón',                 '#22C55E', '🥦', 4),
  ('00000000-0000-0000-0000-000000000005', 'Frutas',     'Frutas frescas y secas',                     '#EC4899', '🍎', 5),
  ('00000000-0000-0000-0000-000000000006', 'Grasas',     'Aceites, nueces, aguacate y mantequillas',   '#EAB308', '🧈', 6),
  ('00000000-0000-0000-0000-000000000007', 'Azúcares',   'Dulces, miel, azúcar y refrescos',           '#A855F7', '🍬', 7)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- GLOBAL FOOD EXCHANGES
-- calories, carbs_g, protein_g, fat_g, fiber_g
-- All is_global = TRUE (admin-curated)
-- =====================================================

-- HARINAS (80 kcal / 15g carbs / 3g prot / 0g fat per exchange typically)
INSERT INTO public.food_exchanges (category_id, name, portion_amount, portion_grams, calories, carbs_g, protein_g, fat_g, fiber_g, is_global) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Arroz blanco cocido',       '1/3 taza',    65,  80, 15, 2, 0,   0.2),
  ('00000000-0000-0000-0000-000000000001', 'Arroz integral cocido',     '1/3 taza',    65,  82, 17, 2, 0.3, 1.8),
  ('00000000-0000-0000-0000-000000000001', 'Pasta cocida',              '1/3 taza',    65,  78, 15, 3, 0.5, 0.9),
  ('00000000-0000-0000-0000-000000000001', 'Pan blanco',                '1 rebanada',  25,  80, 15, 3, 1,   0.7),
  ('00000000-0000-0000-0000-000000000001', 'Pan integral',              '1 rebanada',  25,  80, 15, 4, 1,   2.1),
  ('00000000-0000-0000-0000-000000000001', 'Tortilla de maíz',          '1 pieza',     30,  80, 15, 2, 0.5, 1.5),
  ('00000000-0000-0000-0000-000000000001', 'Tortilla de harina',        '1 pieza',     30,  80, 15, 2, 2,   0.5),
  ('00000000-0000-0000-0000-000000000001', 'Avena cocida',              '1/2 taza',    80,  80, 14, 3, 1.5, 2.0),
  ('00000000-0000-0000-0000-000000000001', 'Papa cocida',               '1/2 pieza med',80, 80, 15, 2, 0,   1.8),
  ('00000000-0000-0000-0000-000000000001', 'Camote cocido',             '1/3 taza',    75,  80, 18, 1, 0,   2.7),
  ('00000000-0000-0000-0000-000000000001', 'Plátano macho cocido',      '1/3 taza',    65,  83, 20, 1, 0,   1.1),
  ('00000000-0000-0000-0000-000000000001', 'Cereal de caja (sin azúcar)','3/4 taza',   30,  80, 15, 2, 1,   1.5),
  ('00000000-0000-0000-0000-000000000001', 'Galletas integrales',       '3 piezas',    21,  80, 15, 2, 2,   1.8),
  ('00000000-0000-0000-0000-000000000001', 'Frijoles cocidos',          '1/3 taza',    80,  80, 15, 5, 0.5, 4.5),
  ('00000000-0000-0000-0000-000000000001', 'Lentejas cocidas',          '1/3 taza',    70,  80, 14, 5, 0.3, 5.5);

-- PROTEÍNAS (55–75 kcal / 0g carbs / 7g prot / 3–8g fat per exchange typically)
INSERT INTO public.food_exchanges (category_id, name, portion_amount, portion_grams, calories, carbs_g, protein_g, fat_g, fiber_g, is_global) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Pechuga de pollo',          '30 g',        30,  55,  0, 7, 2,   0),
  ('00000000-0000-0000-0000-000000000002', 'Atún en agua',              '1/4 taza',    55,  55,  0, 8, 1,   0),
  ('00000000-0000-0000-0000-000000000002', 'Clara de huevo',            '2 piezas',    66,  35,  0, 7, 0,   0),
  ('00000000-0000-0000-0000-000000000002', 'Huevo entero',              '1 pieza',     50,  75,  0, 7, 5,   0),
  ('00000000-0000-0000-0000-000000000002', 'Carne molida magra (90%)',  '30 g',        30,  55,  0, 7, 3,   0),
  ('00000000-0000-0000-0000-000000000002', 'Salmón',                    '30 g',        30,  55,  0, 7, 3,   0),
  ('00000000-0000-0000-0000-000000000002', 'Tilapia',                   '30 g',        30,  55,  0, 7, 1,   0),
  ('00000000-0000-0000-0000-000000000002', 'Queso cottage bajo en grasa','1/4 taza',   56,  55,  2, 7, 1,   0),
  ('00000000-0000-0000-0000-000000000002', 'Tofu firme',                '1/4 taza',    40,  55,  2, 6, 3,   0),
  ('00000000-0000-0000-0000-000000000002', 'Jamón de pavo',             '30 g',        30,  55,  1, 7, 2,   0);

-- LÁCTEOS (100–120 kcal / 12g carbs / 8g prot / 0–5g fat)
INSERT INTO public.food_exchanges (category_id, name, portion_amount, portion_grams, calories, carbs_g, protein_g, fat_g, fiber_g, is_global) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Leche descremada',          '1 taza',      240, 90,  12, 8, 0,   0),
  ('00000000-0000-0000-0000-000000000003', 'Leche entera',              '1 taza',      240, 150, 12, 8, 8,   0),
  ('00000000-0000-0000-0000-000000000003', 'Leche semidescremada',      '1 taza',      240, 120, 12, 8, 5,   0),
  ('00000000-0000-0000-0000-000000000003', 'Yogur natural sin grasa',   '3/4 taza',    170, 90,  13, 9, 0,   0),
  ('00000000-0000-0000-0000-000000000003', 'Yogur griego sin grasa',    '1/2 taza',    120, 90,   7, 12,0,   0),
  ('00000000-0000-0000-0000-000000000003', 'Leche de soya sin azúcar',  '1 taza',      240, 90,   4, 7, 4,   0);

-- VERDURAS (25 kcal / 5g carbs / 2g prot / 0g fat per exchange)
INSERT INTO public.food_exchanges (category_id, name, portion_amount, portion_grams, calories, carbs_g, protein_g, fat_g, fiber_g, is_global) VALUES
  ('00000000-0000-0000-0000-000000000004', 'Brócoli cocido',            '1/2 taza',    78,  25, 5,  2, 0,   2.3),
  ('00000000-0000-0000-0000-000000000004', 'Espinacas cocidas',         '1/2 taza',    90,  25, 4,  3, 0,   2.2),
  ('00000000-0000-0000-0000-000000000004', 'Zanahoria cruda',           '1/2 taza',    61,  25, 6,  0.5,0,  1.7),
  ('00000000-0000-0000-0000-000000000004', 'Tomate',                    '1 taza',      180, 25, 5,  1, 0.3, 1.5),
  ('00000000-0000-0000-0000-000000000004', 'Pepino',                    '1 taza',      119, 15, 3,  0.6,0,  0.5),
  ('00000000-0000-0000-0000-000000000004', 'Calabacín cocido',          '1/2 taza',    90,  20, 4,  1, 0.4, 1.2),
  ('00000000-0000-0000-0000-000000000004', 'Lechuga',                   '1 taza',      55,  15, 3,  1, 0,   1.3),
  ('00000000-0000-0000-0000-000000000004', 'Champiñones',               '1/2 taza',    78,  20, 3,  2, 0,   0.9);

-- FRUTAS (60 kcal / 15g carbs / 0g prot / 0g fat per exchange)
INSERT INTO public.food_exchanges (category_id, name, portion_amount, portion_grams, calories, carbs_g, protein_g, fat_g, fiber_g, is_global) VALUES
  ('00000000-0000-0000-0000-000000000005', 'Manzana',                   '1 pequeña',   138, 60, 15, 0, 0,   2.7),
  ('00000000-0000-0000-0000-000000000005', 'Plátano/Banana',            '1/2 pieza',   60,  60, 15, 0, 0,   1.4),
  ('00000000-0000-0000-0000-000000000005', 'Naranja',                   '1 pequeña',   121, 60, 15, 0, 0,   3.1),
  ('00000000-0000-0000-0000-000000000005', 'Papaya',                    '3/4 taza',    113, 60, 15, 0, 0,   1.7),
  ('00000000-0000-0000-0000-000000000005', 'Fresas',                    '1 1/4 taza',  180, 60, 15, 1, 0,   2.9),
  ('00000000-0000-0000-0000-000000000005', 'Uvas',                      '17 piezas',   85,  60, 15, 0, 0,   0.8),
  ('00000000-0000-0000-0000-000000000005', 'Melón',                     '1 taza',      156, 60, 14, 1, 0,   1.4),
  ('00000000-0000-0000-0000-000000000005', 'Mango',                     '1/2 taza',    83,  60, 15, 0, 0,   1.5);

-- GRASAS (45 kcal / 0g carbs / 0g prot / 5g fat per exchange)
INSERT INTO public.food_exchanges (category_id, name, portion_amount, portion_grams, calories, carbs_g, protein_g, fat_g, fiber_g, is_global) VALUES
  ('00000000-0000-0000-0000-000000000006', 'Aceite de oliva',           '1 cucharadita',5,  45,  0, 0, 5,   0),
  ('00000000-0000-0000-0000-000000000006', 'Aguacate',                  '1/8 pieza',   30,  45,  2, 0, 4,   1.9),
  ('00000000-0000-0000-0000-000000000006', 'Almendras',                 '6 piezas',    24,  45,  2, 1, 4,   0.9),
  ('00000000-0000-0000-0000-000000000006', 'Nueces',                    '4 mitades',   15,  45,  1, 1, 4,   0.5),
  ('00000000-0000-0000-0000-000000000006', 'Mantequilla de maní',       '1/2 cucharada',8,  45,  2, 1, 4,   0.3),
  ('00000000-0000-0000-0000-000000000006', 'Crema de leche',            '2 cucharadas',30,  50,  1, 0, 5,   0),
  ('00000000-0000-0000-0000-000000000006', 'Semillas de chía',          '1 cucharada', 12,  58,  4, 2, 4,   3.8);

-- AZÚCARES (60 kcal / 15g carbs / 0g prot / 0g fat per exchange)
INSERT INTO public.food_exchanges (category_id, name, portion_amount, portion_grams, calories, carbs_g, protein_g, fat_g, fiber_g, is_global) VALUES
  ('00000000-0000-0000-0000-000000000007', 'Azúcar blanca',             '1 cucharada', 12,  45, 12, 0, 0,   0),
  ('00000000-0000-0000-0000-000000000007', 'Miel de abeja',             '1 cucharada', 21,  60, 17, 0, 0,   0),
  ('00000000-0000-0000-0000-000000000007', 'Mermelada',                 '1 cucharada', 20,  55, 14, 0, 0,   0.2),
  ('00000000-0000-0000-0000-000000000007', 'Refresco regular',          '1/3 taza',    80,  60, 15, 0, 0,   0),
  ('00000000-0000-0000-0000-000000000007', 'Chocolate oscuro 70%',      '3 cuadros',   15,  70,  8, 1, 5,   1.1);
