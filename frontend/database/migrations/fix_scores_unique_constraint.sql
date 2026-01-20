-- ================================================
-- FLOWSTATE - MIGRATION: FIX UNIQUE CONSTRAINT
-- ================================================
-- The previous constraint unique(user_id, date_key) prevented
-- users from having scores for different modes on the same day.
-- We need to change it to unique(user_id, date_key, mode).
-- ================================================

-- 1. Drop the old constraint
ALTER TABLE public.scores 
DROP CONSTRAINT IF EXISTS scores_user_id_date_key_key;

-- 2. Add the new constraint
ALTER TABLE public.scores 
ADD CONSTRAINT scores_user_id_date_key_mode_key 
UNIQUE (user_id, date_key, mode);

-- 3. Verify
SELECT 
    schemaname, 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'scores' 
AND indexname LIKE '%unique%';
