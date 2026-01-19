# FlowState Database Schema

Production-ready Supabase database schema.

## Setup (Yeni Kurulum)

Supabase SQL Editor'da sırasıyla çalıştırın:

```
1. 00_master_schema.sql  (Core tables)
2. 01_analytics.sql      (User visits & events)
3. 02_ab_testing.sql     (A/B experiments)
4. 03_admin.sql          (Admin functions)
5. 04_referral.sql       (Referral system)
6. 05_error_tracking.sql (Error logs)
```

## Dosya Yapısı

| Dosya | İçerik |
|-------|--------|
| `00_master_schema.sql` | profiles, user_progress, user_economy, user_inventory, scores, campaign_progress, game_sessions, daily_challenges, user_achievements, purchase_history |
| `01_analytics.sql` | user_visits, analytics_events, get_daily_stats(), get_country_stats() |
| `02_ab_testing.sql` | experiment_assignments, experiment_events |
| `03_admin.sql` | get_retention_stats(), get_funnel_stats(), user_moderation, admin_broadcasts |
| `04_referral.sql` | referral_codes, referral_usages |
| `05_error_tracking.sql` | error_logs, get_error_stats() |

## Production Checklist

- [ ] Supabase'de tüm SQL dosyalarını çalıştır
- [ ] Environment variables ayarla (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Admin password'ü değiştir (adminService.ts)
- [ ] RLS policies'i test et
- [ ] Backup stratejisi oluştur
