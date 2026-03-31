-- ─────────────────────────────────────────────────────────────────────────────
-- Rezeta 50 · Migración inicial
-- Ejecutar en el SQL Editor de Supabase
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensiones ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE zone_code AS ENUM (
    'cervical', 'dorsal', 'lumbar',
    'shoulder', 'elbow', 'wrist',
    'hip', 'knee', 'ankle_foot'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE zone_side AS ENUM ('r', 'l');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE zone_level AS ENUM ('verde', 'ambar', 'rojo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE questionnaire_status AS ENUM ('draft', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE program_phase AS ENUM ('prehab', 'rehab_fase1', 'rehab_fase2');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tabla: questionnaires ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questionnaires (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        questionnaire_status NOT NULL DEFAULT 'draft',
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questionnaires_user_id ON questionnaires(user_id);

ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questionnaires_select_own"
  ON questionnaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "questionnaires_insert_own"
  ON questionnaires FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "questionnaires_update_own"
  ON questionnaires FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "questionnaires_delete_own"
  ON questionnaires FOR DELETE
  USING (auth.uid() = user_id);

-- ── Tabla: body_zones ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS body_zones (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id    UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  zone_code           zone_code NOT NULL,
  side                zone_side,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE body_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "body_zones_select_own"
  ON body_zones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q
      WHERE q.id = body_zones.questionnaire_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "body_zones_insert_own"
  ON body_zones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questionnaires q
      WHERE q.id = body_zones.questionnaire_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "body_zones_delete_own"
  ON body_zones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q
      WHERE q.id = body_zones.questionnaire_id
        AND q.user_id = auth.uid()
    )
  );

-- ── Tabla: zone_answers ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zone_answers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  body_zone_id  UUID NOT NULL REFERENCES body_zones(id) ON DELETE CASCADE,
  question_key  TEXT NOT NULL,
  answer_value  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE zone_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zone_answers_select_own"
  ON zone_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM body_zones bz
      JOIN questionnaires q ON q.id = bz.questionnaire_id
      WHERE bz.id = zone_answers.body_zone_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "zone_answers_insert_own"
  ON zone_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM body_zones bz
      JOIN questionnaires q ON q.id = bz.questionnaire_id
      WHERE bz.id = zone_answers.body_zone_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "zone_answers_delete_own"
  ON zone_answers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM body_zones bz
      JOIN questionnaires q ON q.id = bz.questionnaire_id
      WHERE bz.id = zone_answers.body_zone_id
        AND q.user_id = auth.uid()
    )
  );

-- ── Tabla: global_answers ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS global_answers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id    UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_key        TEXT NOT NULL,
  answer_value        TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE global_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "global_answers_select_own"
  ON global_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q
      WHERE q.id = global_answers.questionnaire_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "global_answers_insert_own"
  ON global_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questionnaires q
      WHERE q.id = global_answers.questionnaire_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "global_answers_delete_own"
  ON global_answers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q
      WHERE q.id = global_answers.questionnaire_id
        AND q.user_id = auth.uid()
    )
  );

-- ── Tabla: reports ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id    UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_data         JSONB NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── Tabla: programs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  zone_codes      zone_code[] NOT NULL DEFAULT '{}',
  level           zone_level NOT NULL,
  phase           program_phase NOT NULL,
  harbiz_url      TEXT NOT NULL,
  price_eur       NUMERIC(6,2) NOT NULL,
  duration_weeks  INTEGER NOT NULL,
  sessions_week   INTEGER NOT NULL,
  floor_required  BOOLEAN NOT NULL DEFAULT false,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Lectura pública: cualquiera puede ver los programas activos
CREATE POLICY "programs_select_public"
  ON programs FOR SELECT
  USING (active = true);

-- Escritura solo admin (rol admin en user_metadata)
CREATE POLICY "programs_insert_admin"
  ON programs FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "programs_update_admin"
  ON programs FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "programs_delete_admin"
  ON programs FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── Trigger: updated_at automático ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questionnaires_updated_at
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
