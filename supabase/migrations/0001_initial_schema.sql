CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  preset_avatar text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE decks (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  owner uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE cards (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  deck_id uuid REFERENCES decks(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE card_learning_status (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('green', 'yellow', 'red')),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(card_id, user_id)
);

CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text CHECK (type IN ('daily', 'weekly', 'monthly')),
  count integer DEFAULT 0,
  date date NOT NULL
);

CREATE TABLE imported_files (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE quiz_sessions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  topic text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE quiz_participants (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id uuid REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer DEFAULT 0
);

CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id uuid REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  front text,
  back text
);

CREATE TABLE quiz_answers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  correct boolean
);

CREATE INDEX idx_decks_owner ON decks(owner);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_card_learning_status_user_id ON card_learning_status(user_id);
CREATE INDEX idx_card_learning_status_card_id ON card_learning_status(card_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_imported_files_user_id ON imported_files(user_id);
CREATE INDEX idx_quiz_participants_session_id ON quiz_participants(session_id);
CREATE INDEX idx_quiz_participants_user_id ON quiz_participants(user_id);
CREATE INDEX idx_quiz_questions_session_id ON quiz_questions(session_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX idx_quiz_answers_user_id ON quiz_answers(user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_learning_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_delete ON profiles FOR DELETE USING (auth.uid() = id);

CREATE POLICY decks_select ON decks FOR SELECT USING (auth.uid() = owner OR is_public = true);
CREATE POLICY decks_insert ON decks FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY decks_update ON decks FOR UPDATE USING (auth.uid() = owner);
CREATE POLICY decks_delete ON decks FOR DELETE USING (auth.uid() = owner);

CREATE POLICY cards_select ON cards FOR SELECT USING (
  auth.uid() = (SELECT owner FROM decks WHERE id = deck_id)
);
CREATE POLICY cards_insert ON cards FOR INSERT WITH CHECK (
  auth.uid() = (SELECT owner FROM decks WHERE id = deck_id)
);
CREATE POLICY cards_update ON cards FOR UPDATE USING (
  auth.uid() = (SELECT owner FROM decks WHERE id = deck_id)
);
CREATE POLICY cards_delete ON cards FOR DELETE USING (
  auth.uid() = (SELECT owner FROM decks WHERE id = deck_id)
);

CREATE POLICY card_learning_status_select ON card_learning_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY card_learning_status_insert ON card_learning_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY card_learning_status_update ON card_learning_status FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY card_learning_status_delete ON card_learning_status FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY achievements_select ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY achievements_insert ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY achievements_update ON achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY achievements_delete ON achievements FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY imported_files_select ON imported_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY imported_files_insert ON imported_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY imported_files_update ON imported_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY imported_files_delete ON imported_files FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY quiz_sessions_select ON quiz_sessions FOR SELECT USING (true);

CREATE POLICY quiz_participants_select ON quiz_participants FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM quiz_participants WHERE session_id = quiz_participants.session_id)
);
CREATE POLICY quiz_participants_insert ON quiz_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY quiz_participants_update ON quiz_participants FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY quiz_questions_select ON quiz_questions FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM quiz_participants WHERE session_id = quiz_questions.session_id)
);
CREATE POLICY quiz_questions_insert ON quiz_questions FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM quiz_participants WHERE session_id = quiz_questions.session_id)
);

CREATE POLICY quiz_answers_select ON quiz_answers FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM quiz_participants WHERE session_id = (SELECT session_id FROM quiz_questions WHERE id = quiz_answers.question_id))
);
CREATE POLICY quiz_answers_insert ON quiz_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY quiz_answers_update ON quiz_answers FOR UPDATE USING (auth.uid() = user_id);