-- DEBUG SCRIPT
-- Bu scripti çalıştırıp sonucunu (JSON veya tablo olarak) paylaşabilir misiniz?
-- Veritabanında GERÇEKTEN başka kayıt var mı kontrol edelim.

-- 1. Tablodaki TÜM kayıtları getir (ilk 20)
SELECT user_id, username, date_key, mode, moves, time_ms 
FROM scores 
ORDER BY created_at DESC 
LIMIT 20;

-- 2. RLS Politikalarının aktif olup olmadığını kontrol et
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'scores';

-- 3. Mevcut politikaları listele
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'scores';
