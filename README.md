# ─── Supabase ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://dhgnfqqtwnbebikkaoyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_eEbpdM8N-EHWVsAkYXeeVw_3Az6TaaL

# ─── Prisma / PostgreSQL ──────────────────────────────────────
# Connection pooling via Supavisor (usar em queries normais)
DATABASE_URL=postgresql://postgres:53LtdWlP4bjNeMwv@db.dhgnfqqtwnbebikkaoyo.supabase.co:5432/postgres

# Direct connection (usar em migrations: prisma db push / migrate dev)
DIRECT_URL=postgresql://postgres:53LtdWlP4bjNeMwv@db.dhgnfqqtwnbebikkaoyo.supabase.co:5432/postgres
