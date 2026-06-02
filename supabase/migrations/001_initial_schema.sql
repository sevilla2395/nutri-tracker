-- =====================================================
-- NutriTracker - Initial Database Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: profiles
-- Extends Supabase auth.users with app-level data
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: food_categories
-- E.g., Harinas, Proteínas, Grasas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.food_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex   TEXT NOT NULL DEFAULT '#6B7280',
  icon        TEXT NOT NULL DEFAULT '🍽️',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: food_exchanges
-- The actual food items with nutritional data
-- =====================================================
CREATE TABLE IF NOT EXISTS public.food_exchanges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES public.food_categories(id) ON DELETE RESTRICT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  portion_amount  TEXT NOT NULL,         -- e.g., "1/2 taza"
  portion_grams   NUMERIC(8,2),          -- optional weight
  calories        NUMERIC(8,2) NOT NULL DEFAULT 0,
  carbs_g         NUMERIC(8,2) NOT NULL DEFAULT 0,
  protein_g       NUMERIC(8,2) NOT NULL DEFAULT 0,
  fat_g           NUMERIC(8,2) NOT NULL DEFAULT 0,
  fiber_g         NUMERIC(8,2) NOT NULL DEFAULT 0,
  is_global       BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = admin-curated
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: user_food_preferences
-- Per-user activation/deactivation of any food
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_food_preferences (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id     UUID NOT NULL REFERENCES public.food_exchanges(id) ON DELETE CASCADE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, food_id)
);

-- =====================================================
-- TABLE: plan_templates
-- User's named diet plans
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plan_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: meal_slots
-- E.g., Desayuno, Almuerzo, Cena
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meal_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID NOT NULL REFERENCES public.plan_templates(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: meal_slot_requirements
-- Exchange targets per meal slot
-- E.g., Desayuno → 2 Harinas, 1 Proteína
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meal_slot_requirements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_slot_id    UUID NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.food_categories(id) ON DELETE RESTRICT,
  exchange_count  NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (exchange_count > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meal_slot_id, category_id)
);

-- =====================================================
-- TABLE: daily_logs
-- One log per user per plan per date
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id     UUID NOT NULL REFERENCES public.plan_templates(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, plan_id, log_date)
);

-- =====================================================
-- TABLE: daily_log_entries
-- Actual food selections per requirement
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_log_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id            UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  meal_slot_id      UUID NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE,
  requirement_id    UUID NOT NULL REFERENCES public.meal_slot_requirements(id) ON DELETE CASCADE,
  food_id           UUID NOT NULL REFERENCES public.food_exchanges(id) ON DELETE RESTRICT,
  exchange_quantity NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (exchange_quantity > 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_food_exchanges_category ON public.food_exchanges(category_id);
CREATE INDEX IF NOT EXISTS idx_food_exchanges_created_by ON public.food_exchanges(created_by);
CREATE INDEX IF NOT EXISTS idx_food_exchanges_is_global ON public.food_exchanges(is_global);
CREATE INDEX IF NOT EXISTS idx_user_food_prefs_user ON public.user_food_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_templates_user ON public.plan_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_slots_plan ON public.meal_slots(plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_log_entries_log ON public.daily_log_entries(log_id);

-- =====================================================
-- TRIGGER: auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: auto-update updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_food_exchanges_updated_at BEFORE UPDATE ON public.food_exchanges
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_plan_templates_updated_at BEFORE UPDATE ON public.plan_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_slot_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_entries ENABLE ROW LEVEL SECURITY;

-- profiles: users see/edit only their own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- food_categories: all authenticated users can read; only admin can write
CREATE POLICY "food_categories_select_all" ON public.food_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "food_categories_admin_insert" ON public.food_categories FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "food_categories_admin_update" ON public.food_categories FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- food_exchanges: read global foods OR own foods; write only own
CREATE POLICY "food_exchanges_select" ON public.food_exchanges FOR SELECT TO authenticated USING (
  is_global = TRUE OR created_by = auth.uid()
);
CREATE POLICY "food_exchanges_insert_own" ON public.food_exchanges FOR INSERT TO authenticated WITH CHECK (
  created_by = auth.uid()
);
CREATE POLICY "food_exchanges_update_own" ON public.food_exchanges FOR UPDATE TO authenticated USING (
  created_by = auth.uid()
);
CREATE POLICY "food_exchanges_delete_own" ON public.food_exchanges FOR DELETE TO authenticated USING (
  created_by = auth.uid()
);

-- user_food_preferences: own rows only
CREATE POLICY "user_food_prefs_all_own" ON public.user_food_preferences FOR ALL TO authenticated USING (
  user_id = auth.uid()
) WITH CHECK (user_id = auth.uid());

-- plan_templates: own rows only
CREATE POLICY "plan_templates_all_own" ON public.plan_templates FOR ALL TO authenticated USING (
  user_id = auth.uid()
) WITH CHECK (user_id = auth.uid());

-- meal_slots: own (via plan ownership)
CREATE POLICY "meal_slots_all_own" ON public.meal_slots FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.plan_templates WHERE id = plan_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.plan_templates WHERE id = plan_id AND user_id = auth.uid())
);

-- meal_slot_requirements: own (via slot → plan ownership)
CREATE POLICY "meal_slot_reqs_all_own" ON public.meal_slot_requirements FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.meal_slots ms
    JOIN public.plan_templates pt ON pt.id = ms.plan_id
    WHERE ms.id = meal_slot_id AND pt.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meal_slots ms
    JOIN public.plan_templates pt ON pt.id = ms.plan_id
    WHERE ms.id = meal_slot_id AND pt.user_id = auth.uid()
  )
);

-- daily_logs: own rows only
CREATE POLICY "daily_logs_all_own" ON public.daily_logs FOR ALL TO authenticated USING (
  user_id = auth.uid()
) WITH CHECK (user_id = auth.uid());

-- daily_log_entries: own (via log ownership)
CREATE POLICY "daily_log_entries_all_own" ON public.daily_log_entries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.daily_logs WHERE id = log_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.daily_logs WHERE id = log_id AND user_id = auth.uid())
);
