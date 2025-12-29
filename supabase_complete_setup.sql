-- ============================================================================
-- MEMOMIAU_V2 - COMPLETE SUPABASE DATABASE SETUP
-- ============================================================================
-- This script creates the complete database structure for the Memomiau_v2 project
-- including all tables, triggers, RLS policies, storage policies, and seed data.
--
-- Execute this script in the Supabase SQL Editor in the following order:
-- 1. Extensions
-- 2. Tables
-- 3. Indexes
-- 4. RLS Activation
-- 5. RLS Policies
-- 6. Triggers
-- 7. Storage Policies
-- 8. Seed Data
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- Profiles Table (User Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  username text,  -- Nullable to allow trigger to create initial profile
  email text UNIQUE NOT NULL,
  avatar_url text,
  preset_avatar text,
  created_at timestamptz DEFAULT now()
);

-- Decks Table (Flashcard Decks)
CREATE TABLE IF NOT EXISTS public.decks (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  owner uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cards Table (Flashcards)
CREATE TABLE IF NOT EXISTS public.cards (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  deck_id uuid REFERENCES public.decks(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Card Learning Status Table (Traffic Light System)
CREATE TABLE IF NOT EXISTS public.card_learning_status (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  card_id uuid REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('green', 'yellow', 'red')),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(card_id, user_id)
);

-- Achievements Table (User Statistics)
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text CHECK (type IN ('daily', 'weekly', 'monthly')),
  count integer DEFAULT 0,
  date date NOT NULL
);

-- Imported Files Table
CREATE TABLE IF NOT EXISTS public.imported_files (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Quiz Sessions Table
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  topic text,
  created_at timestamptz DEFAULT now()
);

-- Quiz Participants Table
CREATE TABLE IF NOT EXISTS public.quiz_participants (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id uuid REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  score integer DEFAULT 0
);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id uuid REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  front text,
  back text
);

-- Quiz Answers Table
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  question_id uuid REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  correct boolean
);

-- Avatar Images Table (Public Avatar Pool)
CREATE TABLE IF NOT EXISTS public.avatar_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL UNIQUE,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_decks_owner ON public.decks(owner);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON public.cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_learning_status_user_id ON public.card_learning_status(user_id);
CREATE INDEX IF NOT EXISTS idx_card_learning_status_card_id ON public.card_learning_status(card_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_files_user_id ON public.imported_files(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_session_id ON public.quiz_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_user_id ON public.quiz_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id ON public.quiz_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_id ON public.quiz_answers(user_id);

-- Partial unique index for username (only when not NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_learning_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ===== PROFILES POLICIES =====
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- ===== DECKS POLICIES =====
DROP POLICY IF EXISTS decks_select ON public.decks;
CREATE POLICY decks_select ON public.decks 
  FOR SELECT 
  USING (auth.uid() = owner OR is_public = true);

DROP POLICY IF EXISTS decks_insert ON public.decks;
CREATE POLICY decks_insert ON public.decks 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner);

DROP POLICY IF EXISTS decks_update ON public.decks;
CREATE POLICY decks_update ON public.decks 
  FOR UPDATE 
  USING (auth.uid() = owner);

DROP POLICY IF EXISTS decks_delete ON public.decks;
CREATE POLICY decks_delete ON public.decks 
  FOR DELETE 
  USING (auth.uid() = owner);

-- ===== CARDS POLICIES =====
DROP POLICY IF EXISTS cards_select ON public.cards;
CREATE POLICY cards_select ON public.cards 
  FOR SELECT 
  USING (
    auth.uid() = (SELECT owner FROM public.decks WHERE id = deck_id)
  );

DROP POLICY IF EXISTS cards_insert ON public.cards;
CREATE POLICY cards_insert ON public.cards 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = (SELECT owner FROM public.decks WHERE id = deck_id)
  );

DROP POLICY IF EXISTS cards_update ON public.cards;
CREATE POLICY cards_update ON public.cards 
  FOR UPDATE 
  USING (
    auth.uid() = (SELECT owner FROM public.decks WHERE id = deck_id)
  );

DROP POLICY IF EXISTS cards_delete ON public.cards;
CREATE POLICY cards_delete ON public.cards 
  FOR DELETE 
  USING (
    auth.uid() = (SELECT owner FROM public.decks WHERE id = deck_id)
  );

-- ===== CARD LEARNING STATUS POLICIES =====
DROP POLICY IF EXISTS card_learning_status_select ON public.card_learning_status;
CREATE POLICY card_learning_status_select ON public.card_learning_status 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS card_learning_status_insert ON public.card_learning_status;
CREATE POLICY card_learning_status_insert ON public.card_learning_status 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS card_learning_status_update ON public.card_learning_status;
CREATE POLICY card_learning_status_update ON public.card_learning_status 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS card_learning_status_delete ON public.card_learning_status;
CREATE POLICY card_learning_status_delete ON public.card_learning_status 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ===== ACHIEVEMENTS POLICIES =====
DROP POLICY IF EXISTS achievements_select ON public.achievements;
CREATE POLICY achievements_select ON public.achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS achievements_insert ON public.achievements;
CREATE POLICY achievements_insert ON public.achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS achievements_update ON public.achievements;
CREATE POLICY achievements_update ON public.achievements 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS achievements_delete ON public.achievements;
CREATE POLICY achievements_delete ON public.achievements 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ===== IMPORTED FILES POLICIES =====
DROP POLICY IF EXISTS imported_files_select ON public.imported_files;
CREATE POLICY imported_files_select ON public.imported_files 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS imported_files_insert ON public.imported_files;
CREATE POLICY imported_files_insert ON public.imported_files 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS imported_files_update ON public.imported_files;
CREATE POLICY imported_files_update ON public.imported_files 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS imported_files_delete ON public.imported_files;
CREATE POLICY imported_files_delete ON public.imported_files 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ===== QUIZ SESSIONS POLICIES =====
DROP POLICY IF EXISTS quiz_sessions_select ON public.quiz_sessions;
CREATE POLICY quiz_sessions_select ON public.quiz_sessions 
  FOR SELECT 
  USING (true);

-- ===== QUIZ PARTICIPANTS POLICIES =====
DROP POLICY IF EXISTS quiz_participants_select ON public.quiz_participants;
CREATE POLICY quiz_participants_select ON public.quiz_participants 
  FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM public.quiz_participants WHERE session_id = quiz_participants.session_id)
  );

DROP POLICY IF EXISTS quiz_participants_insert ON public.quiz_participants;
CREATE POLICY quiz_participants_insert ON public.quiz_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS quiz_participants_update ON public.quiz_participants;
CREATE POLICY quiz_participants_update ON public.quiz_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- ===== QUIZ QUESTIONS POLICIES =====
DROP POLICY IF EXISTS quiz_questions_select ON public.quiz_questions;
CREATE POLICY quiz_questions_select ON public.quiz_questions 
  FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM public.quiz_participants WHERE session_id = quiz_questions.session_id)
  );

DROP POLICY IF EXISTS quiz_questions_insert ON public.quiz_questions;
CREATE POLICY quiz_questions_insert ON public.quiz_questions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.quiz_participants WHERE session_id = quiz_questions.session_id)
  );

-- ===== QUIZ ANSWERS POLICIES =====
DROP POLICY IF EXISTS quiz_answers_select ON public.quiz_answers;
CREATE POLICY quiz_answers_select ON public.quiz_answers 
  FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM public.quiz_participants WHERE session_id = (SELECT session_id FROM public.quiz_questions WHERE id = quiz_answers.question_id))
  );

DROP POLICY IF EXISTS quiz_answers_insert ON public.quiz_answers;
CREATE POLICY quiz_answers_insert ON public.quiz_answers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS quiz_answers_update ON public.quiz_answers;
CREATE POLICY quiz_answers_update ON public.quiz_answers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- ===== AVATAR IMAGES POLICIES =====
DROP POLICY IF EXISTS "Anyone can view avatar images" ON public.avatar_images;
CREATE POLICY "Anyone can view avatar images"
  ON public.avatar_images
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert avatars" ON public.avatar_images;
CREATE POLICY "Authenticated users can insert avatars"
  ON public.avatar_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===== STORAGE POLICIES (for profile-avatars bucket) =====
DROP POLICY IF EXISTS "Allow authenticated users to read profile avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to read profile avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Allow authenticated users to list profile avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to list profile avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-avatars');

-- ============================================================================
-- 6. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Auto-create profile for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, 'user_' || new.id::text)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Call handle_new_user when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

-- Insert default cat avatar images
-- NOTE: Update the URLs to match your new Supabase project URL
-- Format: https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/profile-avatars/{filename}
INSERT INTO public.avatar_images (filename, url)
VALUES
  ('cat1.jpg', 'https://ucugkevyqqhpicvqplmj.supabase.co/storage/v1/object/public/profile-avatars/cat1.jpg'),
  ('cat2.jpg', 'https://ucugkevyqqhpicvqplmj.supabase.co/storage/v1/object/public/profile-avatars/cat2.jpg'),
  ('cat3.jpg', 'https://ucugkevyqqhpicvqplmj.supabase.co/storage/v1/object/public/profile-avatars/cat3.jpg'),
  ('cat4.jpg', 'https://ucugkevyqqhpicvqplmj.supabase.co/storage/v1/object/public/profile-avatars/cat4.jpg'),
  ('cat5.jpg', 'https://ucugkevyqqhpicvqplmj.supabase.co/storage/v1/object/public/profile-avatars/cat5.jpg')
ON CONFLICT (filename) DO NOTHING;

-- Add table comments
COMMENT ON TABLE public.profiles IS 'User profile information linked to auth.users';
COMMENT ON TABLE public.decks IS 'Flashcard decks owned by users';
COMMENT ON TABLE public.cards IS 'Individual flashcards within decks';
COMMENT ON TABLE public.card_learning_status IS 'User learning progress for cards (traffic light system)';
COMMENT ON TABLE public.achievements IS 'User statistics and achievements';
COMMENT ON TABLE public.imported_files IS 'Imported files by users';
COMMENT ON TABLE public.quiz_sessions IS 'Quiz game sessions';
COMMENT ON TABLE public.quiz_participants IS 'Participants in quiz sessions';
COMMENT ON TABLE public.quiz_questions IS 'Questions in quiz sessions';
COMMENT ON TABLE public.quiz_answers IS 'User answers to quiz questions';
COMMENT ON TABLE public.avatar_images IS 'Stores public avatar image URLs for profile selection';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Create Storage Bucket 'profile-avatars' (public) in Supabase Dashboard
-- 2. Upload cat1.jpg to cat5.jpg to the profile-avatars bucket
-- 3. Update the avatar URLs in the avatar_images INSERT statement above
-- 4. Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env
-- 5. In Supabase Dashboard > Authentication > Settings:
--    - Disable email confirmations (or set auto-confirm to true)
-- ============================================================================
