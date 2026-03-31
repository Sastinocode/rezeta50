-- ─────────────────────────────────────────────────────────────────────────────
-- Rezeta 50 · Migración 002 — Roles de usuario
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de 001_initial.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tabla user_roles ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- El propio usuario puede leer su rol
CREATE POLICY "user_roles_select_own"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el service_role (server) puede insertar/modificar roles
-- (no se crea policy para INSERT/UPDATE/DELETE en anon/authenticated)

-- ── Índice ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- ── Instrucciones para dar rol admin ─────────────────────────────────────────
/*
  Para dar permisos de admin a un usuario, ejecutar en Supabase SQL Editor:

  INSERT INTO user_roles (user_id, role)
  VALUES ('<UUID_DEL_USUARIO>', 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  Para ver todos los admins:
  SELECT u.email, ur.created_at
  FROM user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'admin';

  Para revocar admin:
  DELETE FROM user_roles
  WHERE user_id = '<UUID_DEL_USUARIO>' AND role = 'admin';
*/
