-- =============================================
-- FLOWSTATE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. USER PROGRESS TABLE
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_wins INTEGER DEFAULT 0,
  fastest_win_ms INTEGER,
  consecutive_no_hint_wins INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USER ECONOMY TABLE
CREATE TABLE IF NOT EXISTS user_economy (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  unlocked_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER INVENTORY TABLE (Power-ups)
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hints INTEGER DEFAULT 0,
  undos INTEGER DEFAULT 0,
  freezes INTEGER DEFAULT 0,
  coin_boosts INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CAMPAIGN PROGRESS TABLE
CREATE TABLE IF NOT EXISTS campaign_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  stars INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- 5. GAME SESSIONS TABLE (Analytics)
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  date_key TEXT,
  moves INTEGER,
  time_ms INTEGER,
  won BOOLEAN DEFAULT FALSE,
  used_hint BOOLEAN DEFAULT FALSE,
  powerups_used JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- USER PROGRESS POLICIES
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = id);

-- USER ECONOMY POLICIES
CREATE POLICY "Users can view own economy" ON user_economy
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own economy" ON user_economy
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own economy" ON user_economy
  FOR UPDATE USING (auth.uid() = id);

-- USER INVENTORY POLICIES
CREATE POLICY "Users can view own inventory" ON user_inventory
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own inventory" ON user_inventory
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own inventory" ON user_inventory
  FOR UPDATE USING (auth.uid() = id);

-- CAMPAIGN PROGRESS POLICIES
CREATE POLICY "Users can view own campaign progress" ON campaign_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaign progress" ON campaign_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign progress" ON campaign_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- GAME SESSIONS POLICIES
CREATE POLICY "Users can view own sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_campaign_progress_user ON campaign_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_date ON game_sessions(date_key);

-- =============================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_timestamp
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_economy_timestamp
  BEFORE UPDATE ON user_economy
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_inventory_timestamp
  BEFORE UPDATE ON user_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
