-- =====================================================
-- NutriTracker - Migration 002: Add username to profiles
-- Run this in your Supabase SQL Editor AFTER migration 001
-- =====================================================

-- Add username column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the trigger so it stores the username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'username',
    'user'
  )
  ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username;
  RETURN NEW;
END;
$$;

-- Disable email confirmation requirement so users can log in immediately
-- (You also need to do this in Supabase Dashboard: Authentication -> Email -> Disable "Confirm email")
