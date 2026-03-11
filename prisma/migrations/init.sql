-- ============================================================
-- JJPT — Jiu-Jitsu para Todos
-- Script de criação inicial das tabelas — Supabase / PostgreSQL
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE "Perfil" AS ENUM ('PROFESSOR', 'ALUNO');
CREATE TYPE "StatusAluno" AS ENUM ('ATIVO', 'INATIVO', 'TRANCADO');
CREATE TYPE "StatusPagamento" AS ENUM ('EM_DIA', 'PENDENTE', 'ATRASADO');
CREATE TYPE "StatusComprovante" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- ─── TABELA: users ───────────────────────────────────────────────────────────
-- Espelha auth.users do Supabase. Criado via trigger após signup.

CREATE TABLE "users" (
  "id"            UUID        NOT NULL,  -- mesmo UUID do Supabase Auth
  "email"         TEXT        NOT NULL,
  "nome"          TEXT        NOT NULL,
  "perfil"        "Perfil"    NOT NULL,
  "avatarUrl"     TEXT,
  "criado_em"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- ─── TABELA: alunos ──────────────────────────────────────────────────────────

CREATE TABLE "alunos" (
  "id"            UUID            NOT NULL DEFAULT gen_random_uuid(),
  "user_id"       UUID            NOT NULL,
  "faixa"         INTEGER         NOT NULL DEFAULT 0,
  "grau"          INTEGER         NOT NULL DEFAULT 0,
  "aulas_no_grau" INTEGER         NOT NULL DEFAULT 0,
  "total_aulas"   INTEGER         NOT NULL DEFAULT 0,
  "status"        "StatusAluno"   NOT NULL DEFAULT 'ATIVO',
  "status_pgto"   "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
  "professor_id"  UUID            NOT NULL,
  "criado_em"     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  "atualizado_em" TIMESTAMPTZ     NOT NULL DEFAULT now(),

  CONSTRAINT "alunos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alunos_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "alunos_professor_id_fkey" FOREIGN KEY ("professor_id")
    REFERENCES "users"("id")
);

CREATE UNIQUE INDEX "alunos_user_id_key" ON "alunos"("user_id");

-- ─── TABELA: checkins ────────────────────────────────────────────────────────

CREATE TABLE "checkins" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "aluno_id"     UUID        NOT NULL,
  "data"         DATE        NOT NULL,
  "hora"         TEXT,
  "aula_label"   TEXT,
  "qr_token"     TEXT,
  "confirmado"   BOOLEAN     NOT NULL DEFAULT false,
  "confirmed_at" TIMESTAMPTZ,
  "confirmed_by" UUID,
  "criado_em"    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "checkins_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "checkins_aluno_id_fkey" FOREIGN KEY ("aluno_id")
    REFERENCES "alunos"("id") ON DELETE CASCADE
);

-- Garante 1 checkin por aluno por dia
CREATE UNIQUE INDEX "checkins_aluno_id_data_key" ON "checkins"("aluno_id", "data");

-- ─── TABELA: pagamentos ──────────────────────────────────────────────────────

CREATE TABLE "pagamentos" (
  "id"               UUID                NOT NULL DEFAULT gen_random_uuid(),
  "aluno_id"         UUID                NOT NULL,
  "valor"            DECIMAL(10, 2)      NOT NULL,
  "descricao"        TEXT                NOT NULL,
  "referencia"       TEXT,
  "status"           "StatusComprovante" NOT NULL DEFAULT 'PENDENTE',
  "arquivo_url"      TEXT                NOT NULL,
  "arquivo_path"     TEXT                NOT NULL,
  "revisado_por"     UUID,
  "revisado_em"      TIMESTAMPTZ,
  "motivo_rejeicao"  TEXT,
  "criado_em"        TIMESTAMPTZ         NOT NULL DEFAULT now(),
  "atualizado_em"    TIMESTAMPTZ         NOT NULL DEFAULT now(),

  CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pagamentos_aluno_id_fkey" FOREIGN KEY ("aluno_id")
    REFERENCES "alunos"("id") ON DELETE CASCADE,
  CONSTRAINT "pagamentos_revisado_por_fkey" FOREIGN KEY ("revisado_por")
    REFERENCES "users"("id")
);

-- ─── TABELA: aulas ───────────────────────────────────────────────────────────
-- Sessões de aula — professor cria, alunos fazem checkin via QR

CREATE TABLE "aulas" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "label"      TEXT        NOT NULL,
  "data"       DATE        NOT NULL,
  "hora"       TEXT        NOT NULL,
  "qr_token"   TEXT        NOT NULL,
  "ativa"      BOOLEAN     NOT NULL DEFAULT true,
  "criado_por" UUID        NOT NULL,
  "criado_em"  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "aulas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aulas_qr_token_key" ON "aulas"("qr_token");

-- ─── TRIGGER: atualizado_em automático ───────────────────────────────────────

CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_atualizado_em
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_alunos_atualizado_em
  BEFORE UPDATE ON "alunos"
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_pagamentos_atualizado_em
  BEFORE UPDATE ON "pagamentos"
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ─── TRIGGER: sincronizar auth.users → public.users ──────────────────────────
-- Cria um registro em public.users automaticamente após signup no Supabase Auth

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RLS (Row Level Security) ────────────────────────────────────────────────
-- Habilita RLS nas tabelas para que o Supabase Auth controle o acesso

ALTER TABLE "users"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alunos"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "checkins"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagamentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aulas"      ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: usuário vê apenas seus próprios dados
-- (ajuste conforme as regras de negócio do professor)

-- users: cada um lê/edita o próprio perfil
CREATE POLICY "users: leitura própria" ON "users"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: edição própria" ON "users"
  FOR UPDATE USING (auth.uid() = id);

-- alunos: professor vê todos os seus alunos; aluno vê o próprio
CREATE POLICY "alunos: professor vê seus alunos" ON "alunos"
  FOR SELECT USING (
    auth.uid() = professor_id
    OR auth.uid() = user_id
  );

-- checkins: aluno vê os próprios; professor vê os de seus alunos
CREATE POLICY "checkins: acesso aluno/professor" ON "checkins"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "alunos" a
      WHERE a.id = aluno_id
        AND (a.user_id = auth.uid() OR a.professor_id = auth.uid())
    )
  );

-- pagamentos: aluno vê os próprios; professor vê os de seus alunos
CREATE POLICY "pagamentos: acesso aluno/professor" ON "pagamentos"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "alunos" a
      WHERE a.id = aluno_id
        AND (a.user_id = auth.uid() OR a.professor_id = auth.uid())
    )
  );

-- aulas: todos autenticados podem ver aulas ativas
CREATE POLICY "aulas: leitura autenticada" ON "aulas"
  FOR SELECT USING (auth.role() = 'authenticated');
