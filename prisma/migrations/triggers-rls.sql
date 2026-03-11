-- ============================================================
-- JJPT — Triggers e RLS
-- Execute após o prisma db push criar as tabelas
-- ============================================================

-- ─── TRIGGER: atualizado_em automático ───────────────────────────────────────

CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_atualizado_em ON "users";
CREATE TRIGGER trg_users_atualizado_em
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS trg_alunos_atualizado_em ON "alunos";
CREATE TRIGGER trg_alunos_atualizado_em
  BEFORE UPDATE ON "alunos"
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS trg_pagamentos_atualizado_em ON "pagamentos";
CREATE TRIGGER trg_pagamentos_atualizado_em
  BEFORE UPDATE ON "pagamentos"
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ─── TRIGGER: sincronizar auth.users → public.users ──────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."users" ("id", "email", "nome", "perfil")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'perfil')::"Perfil", 'ALUNO')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RLS (Row Level Security) ────────────────────────────────────────────────

ALTER TABLE "users"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alunos"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "checkins"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagamentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aulas"      ENABLE ROW LEVEL SECURITY;

-- ─── POLÍTICAS ───────────────────────────────────────────────────────────────

-- users
DROP POLICY IF EXISTS "users: leitura própria" ON "users";
CREATE POLICY "users: leitura própria" ON "users"
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users: edição própria" ON "users";
CREATE POLICY "users: edição própria" ON "users"
  FOR UPDATE USING (auth.uid() = id);

-- alunos
DROP POLICY IF EXISTS "alunos: professor vê seus alunos" ON "alunos";
CREATE POLICY "alunos: professor vê seus alunos" ON "alunos"
  FOR SELECT USING (
    auth.uid() = professor_id
    OR auth.uid() = user_id
  );

-- checkins
DROP POLICY IF EXISTS "checkins: acesso aluno/professor" ON "checkins";
CREATE POLICY "checkins: acesso aluno/professor" ON "checkins"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "alunos" a
      WHERE a.id = aluno_id
        AND (a.user_id = auth.uid() OR a.professor_id = auth.uid())
    )
  );

-- pagamentos
DROP POLICY IF EXISTS "pagamentos: acesso aluno/professor" ON "pagamentos";
CREATE POLICY "pagamentos: acesso aluno/professor" ON "pagamentos"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "alunos" a
      WHERE a.id = aluno_id
        AND (a.user_id = auth.uid() OR a.professor_id = auth.uid())
    )
  );

-- aulas
DROP POLICY IF EXISTS "aulas: leitura autenticada" ON "aulas";
CREATE POLICY "aulas: leitura autenticada" ON "aulas"
  FOR SELECT USING (auth.role() = 'authenticated');
