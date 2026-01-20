-- ================================================
-- FLOWSTATE - LEADERBOARD FIX MIGRATION
-- Run this in Supabase SQL Editor to fix score saving issue
-- ================================================

-- Add UPDATE policy for scores table if it doesn't exist
-- This allows users to update/improve their own scores

DO $$
BEGIN
    -- Check if the UPDATE policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scores' 
        AND policyname LIKE '%update%'
    ) THEN
        -- Create the UPDATE policy
        EXECUTE 'CREATE POLICY "Users can update their own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id)';
        RAISE NOTICE 'UPDATE policy created for scores table';
    ELSE
        RAISE NOTICE 'UPDATE policy already exists for scores table';
    END IF;
END $$;

-- Verify policies are correct
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'scores'
ORDER BY policyname;
