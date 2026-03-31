-- ─────────────────────────────────────────────────────────────────────────────
-- Rezeta 50 · Seed Data — 7 programas Harbiz
-- Ejecutar DESPUÉS de 001_initial.sql
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO programs (
  name,
  description,
  zone_codes,
  level,
  phase,
  harbiz_url,
  price_eur,
  duration_weeks,
  sessions_week,
  floor_required,
  active
) VALUES

(
  'Rehab Lumbar Básico',
  'Programa de rehabilitación para lumbalgia de nivel moderado. Incluye ejercicios de movilidad, fortalecimiento de core y trabajo postural progresivo.',
  ARRAY['lumbar']::zone_code[],
  'ambar',
  'rehab_fase1',
  'https://harbiz.es/programas/rehab-lumbar-basico?utm_source=rezeta50&utm_medium=informe&utm_campaign=lumbar',
  29.00,
  8,
  3,
  false,
  true
),

(
  'Rehab Lumbar Avanzado',
  'Programa intensivo para lumbalgia severa o con irradiación. Progresión desde movilidad básica hasta carga funcional. Requiere valoración previa.',
  ARRAY['lumbar']::zone_code[],
  'rojo',
  'rehab_fase2',
  'https://harbiz.es/programas/rehab-lumbar-avanzado?utm_source=rezeta50&utm_medium=informe&utm_campaign=lumbar',
  39.00,
  10,
  4,
  true,
  true
),

(
  'Rehab Rodilla',
  'Programa de rehabilitación para patología de rodilla (condromalacia, tendinopatía rotuliana, post-esguince). Fortalecimiento progresivo de cuádriceps e isquiotibiales.',
  ARRAY['knee']::zone_code[],
  'ambar',
  'rehab_fase1',
  'https://harbiz.es/programas/rehab-rodilla?utm_source=rezeta50&utm_medium=informe&utm_campaign=knee',
  29.00,
  8,
  3,
  false,
  true
),

(
  'Rehab Hombro',
  'Programa de rehabilitación para tendinopatía del manguito rotador, bursitis subacromial e inestabilidad glenohumeral. Incluye ejercicios excéntricos y de estabilización escapular.',
  ARRAY['shoulder']::zone_code[],
  'ambar',
  'rehab_fase1',
  'https://harbiz.es/programas/rehab-hombro?utm_source=rezeta50&utm_medium=informe&utm_campaign=shoulder',
  29.00,
  8,
  3,
  false,
  true
),

(
  'Prehab Core y Espalda',
  'Programa preventivo para personas con leve tensión lumbar o dorsal. Fortalecimiento de core, movilidad de columna y mejora postural general.',
  ARRAY['lumbar', 'dorsal', 'cervical']::zone_code[],
  'verde',
  'prehab',
  'https://harbiz.es/programas/prehab-core-espalda?utm_source=rezeta50&utm_medium=informe&utm_campaign=lumbar',
  19.00,
  6,
  3,
  false,
  true
),

(
  'Rehab Pie y Tobillo',
  'Programa de rehabilitación para fascitis plantar, tendinopatía aquílea y esguinces de tobillo. Trabajo de propiocepción, fuerza excéntrica y retorno deportivo.',
  ARRAY['ankle_foot']::zone_code[],
  'ambar',
  'rehab_fase1',
  'https://harbiz.es/programas/rehab-pie-tobillo?utm_source=rezeta50&utm_medium=informe&utm_campaign=ankle_foot',
  24.00,
  6,
  3,
  false,
  true
),

(
  'Movilidad General',
  'Programa de movilidad articular global para personas con múltiples zonas afectadas en nivel rojo. Punto de partida seguro antes de cualquier programa específico.',
  ARRAY['cervical', 'dorsal', 'lumbar', 'shoulder', 'hip', 'knee', 'ankle_foot']::zone_code[],
  'rojo',
  'rehab_fase1',
  'https://harbiz.es/programas/movilidad-general?utm_source=rezeta50&utm_medium=informe&utm_campaign=global',
  19.00,
  4,
  4,
  false,
  true
);
