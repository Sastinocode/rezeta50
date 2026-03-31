// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · Motor de matching — zonas → programas Harbiz
// ─────────────────────────────────────────────────────────────────────────────

import type { ProgramSnapshot } from '@/types/database'
import type { ZoneScoreResult, GlobalAnswerMap } from './zoneScore'

// ── Tipo de programa desde Supabase ──────────────────────────────────────────

export interface ProgramRow {
  id: string
  name: string
  description: string | null
  zone_codes: string[]
  level: string
  phase: string
  harbiz_url: string
  price_eur: number
  duration_weeks: number
  sessions_week: number
  floor_required: boolean
  active: boolean
}

// ── Compatibilidad de nivel ───────────────────────────────────────────────────
// Un programa es compatible si su nivel cubre la severidad de la zona:
//   verde → apto para verde y ambar
//   ambar → apto para ambar y rojo
//   rojo  → apto solo para rojo

function isLevelCompatible(programLevel: string, zoneLevel: string): boolean {
  if (programLevel === 'verde') return zoneLevel === 'verde' || zoneLevel === 'ambar'
  if (programLevel === 'ambar') return zoneLevel === 'ambar' || zoneLevel === 'rojo'
  if (programLevel === 'rojo')  return zoneLevel === 'rojo'
  return false
}

// ── Parse goals ───────────────────────────────────────────────────────────────

function parseGoals(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [String(parsed)]
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }
}

// ── Motor de matching ─────────────────────────────────────────────────────────

interface ScoredProgram extends ProgramSnapshot {
  _zoneCount: number  // cuántas zonas cubre este programa (para bonus/penalización)
}

export function matchPrograms(
  zoneScores: ZoneScoreResult[],
  programs: ProgramRow[],
  globalAnswers: GlobalAnswerMap
): ProgramSnapshot[] {
  const goals        = parseGoals(globalAnswers.goals)
  const floorOk      = globalAnswers.floor_exercises !== 'no'
  const isседентаrio = globalAnswers.activity_level === 'sedentary'

  // Solo procesar zonas no-verde
  const affectedZones = zoneScores.filter((z) => z.level !== 'verde')

  if (affectedZones.length === 0) {
    // Usuario sin zonas afectadas — ofrecer programas prehab verde
    const prehabs = programs
      .filter((p) => p.active && p.level === 'verde' && p.phase === 'prehab')
      .filter((p) => (p.floor_required ? floorOk : true))
      .slice(0, 2)
      .map((p) => programToSnapshot(p, 80))
    return prehabs
  }

  // Mapa: program.id → mejor match_score
  const bestByProgram = new Map<string, ScoredProgram>()

  for (const zone of affectedZones) {
    // Programas compatibles con esta zona
    const candidates = programs.filter((p) => {
      if (!p.active) return false
      if (!p.zone_codes.includes(zone.zone_code)) return false
      if (!isLevelCompatible(p.level, zone.level)) return false
      if (p.floor_required && !floorOk) return false
      return true
    })

    for (const prog of candidates) {
      let matchScore = 100

      // +20 si nivel exacto
      if (prog.level === zone.level) matchScore += 20

      // +15 si goals incluye reducir_dolor y el programa es de rehab
      if (
        goals.includes('reducir_dolor') &&
        (prog.phase === 'rehab_fase1' || prog.phase === 'rehab_fase2')
      ) {
        matchScore += 15
      }

      // +15 si goals incluye prevenir y el programa es prehab
      if (goals.includes('prevenir') && prog.phase === 'prehab') {
        matchScore += 15
      }

      // -10 por cada zona extra del programa que el usuario NO tiene
      const userZoneCodes = new Set<string>(affectedZones.map((z) => z.zone_code))
      const extraZones = prog.zone_codes.filter((c) => !userZoneCodes.has(c))
      matchScore -= extraZones.length * 10

      // +10 si sedentario y rehab_fase1 (programa más suave para empezar)
      if (isседентаrio && prog.phase === 'rehab_fase1') matchScore += 10

      // Guardar el mejor score para este programa
      const existing = bestByProgram.get(prog.id)
      if (!existing || matchScore > existing.match_score) {
        bestByProgram.set(prog.id, {
          ...programToSnapshot(prog, matchScore),
          _zoneCount: prog.zone_codes.length,
        })
      }
    }
  }

  // Tomar los N mejores, ordenados por match_score DESC
  const sorted = Array.from(bestByProgram.values())
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 4)  // máximo 4 programas recomendados

  // Devolver sin el campo interno _zoneCount
  return sorted.map(({ _zoneCount: _, ...p }) => p)
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function programToSnapshot(p: ProgramRow, match_score: number): ScoredProgram {
  return {
    id:             p.id,
    name:           p.name,
    description:    p.description,
    phase:          p.phase,
    level:          p.level,
    price_eur:      p.price_eur,
    duration_weeks: p.duration_weeks,
    sessions_week:  p.sessions_week,
    harbiz_url:     p.harbiz_url,
    match_score,
    _zoneCount:     p.zone_codes.length,
  }
}
