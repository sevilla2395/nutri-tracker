-- =====================================================
-- MIGRATION: ALLOW ALL AUTHENTICATED USERS TO EDIT GLOBALS
-- =====================================================

-- 1. DROP old restrictive policies
DROP POLICY IF EXISTS "food_exchanges_update_own" ON public.food_exchanges;
DROP POLICY IF EXISTS "food_categories_admin_update" ON public.food_categories;

-- 2. CREATE new collaborative policies for food_exchanges
-- Anyone can update any food
CREATE POLICY "food_exchanges_update_all" ON public.food_exchanges FOR UPDATE TO authenticated USING (TRUE);

-- 3. CREATE new collaborative policies for food_categories
-- Anyone can update any category
CREATE POLICY "food_categories_update_all" ON public.food_categories FOR UPDATE TO authenticated USING (TRUE);
