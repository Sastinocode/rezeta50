# Rezeta 50

Cuestionario musculoesquelético gratuito para Zincuenta Sport Club (Murcia).

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS**
- **Zustand** (estado del cuestionario)
- **react-hook-form + zod** (formularios)

## Desarrollo local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.production.example .env.local
```

Rellena `.env.local` con tus claves de Supabase:
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clave anon (pública)
- `SUPABASE_SERVICE_ROLE_KEY` — Clave service role (**privada**)

### 3. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta la migración inicial en el SQL Editor:
   ```
   supabase/migrations/001_initial.sql
   ```
3. Carga los programas de ejemplo:
   ```
   supabase/seed.sql
   ```
4. En **Authentication → Providers → Email**, desactiva "Confirm email" para evitar el paso de verificación en dev.

### 4. Arrancar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Deploy en Vercel

### 1. Push a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<usuario>/rezeta50-mvp.git
git push -u origin main
```

### 2. Importar proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa tu repositorio de GitHub
3. Framework: **Next.js** (detectado automáticamente)

### 3. Variables de entorno en Vercel

En **Project Settings → Environment Variables**, añade:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<id>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |

### 4. Deploy

Vercel desplegará automáticamente. La URL por defecto será `rezeta50-mvp.vercel.app`.

Para usar un dominio personalizado (ej. `rezeta50.vercel.app`): **Project Settings → Domains**.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Landing, cuestionario, registro
│   ├── (private)/         # Informe, perfil (requiere auth)
│   └── admin/             # Panel de administración
├── components/
│   ├── questionnaire/     # BodyMap, ZoneForm, GlobalQuestions
│   ├── report/            # ReportSummary, ZoneCard, ProgramCard
│   └── admin/             # ProgramModal
├── lib/
│   ├── algorithm/         # Motor de scoring MSK
│   └── supabase/          # Clientes server/client
├── store/                 # Zustand store del cuestionario
└── types/                 # TypeScript types + Database types
```

## Panel de administración

Acceso en `/admin`. Requiere rol `admin` en la tabla `user_roles`.

Para asignar rol admin a un usuario:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<uuid-del-usuario>', 'admin');
```

---

## Contacto

Zincuenta Sport Club · Murcia
