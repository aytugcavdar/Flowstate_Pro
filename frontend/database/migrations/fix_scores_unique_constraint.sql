-- Fix scores unique constraint and RLS Policies (Safe/Idempotent Version)

-- 1. Ensure 'mode' column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scores' AND column_name = 'mode') THEN 
        ALTER TABLE scores ADD COLUMN mode TEXT DEFAULT 'daily'; 
    END IF; 
END $$;

-- 2. Update constraints safely
DO $$ 
BEGIN 
    -- Drop the old constraint/index if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scores_user_id_date_key_key') THEN 
        ALTER TABLE scores DROP CONSTRAINT scores_user_id_date_key_key; 
    END IF;

    -- Add the new constraint ONLY if it doesn't exist yet
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scores_user_id_date_key_mode_key') THEN 
        ALTER TABLE scores ADD CONSTRAINT scores_user_id_date_key_mode_key UNIQUE (user_id, date_key, mode); 
    END IF; 
END $$;

-- 3. Ensure RLS (Security Policies) are correct
-- This fixes the "I can only see my own score" issue
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can READ scores (The Leaderboard)
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
CREATE POLICY "Scores are viewable by everyone" ON scores FOR SELECT USING (true);

-- Policy: Users can only INSERT their own scores
DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
CREATE POLICY "Users can insert their own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own scores
DROP POLICY IF EXISTS "Users can update their own scores" ON scores;
CREATE POLICY "Users can update their own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);
