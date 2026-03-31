import type { ZoneCode } from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────
// Definición de zonas del body map
// side: 'bilateral' → la zona aparece izquierda y derecha
//       'central'   → zona única (eje central del cuerpo)
// svgPath: se rellenará en BodyMap.tsx con las rutas SVG reales
// ─────────────────────────────────────────────────────────────────────────────

export interface BodyZoneDefinition {
  id: ZoneCode
  label: string
  side: 'bilateral' | 'central'
  svgPath: string
  colors: {
    verde: string
    ambar: string
    rojo: string
    default: string
  }
}

export const BODY_ZONES: BodyZoneDefinition[] = [
  {
    id: 'cervical',
    label: 'Cervical',
    side: 'central',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'dorsal',
    label: 'Dorsal',
    side: 'central',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'lumbar',
    label: 'Lumbar',
    side: 'central',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'shoulder',
    label: 'Hombro',
    side: 'bilateral',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'elbow',
    label: 'Codo',
    side: 'bilateral',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'wrist',
    label: 'Muñeca / Mano',
    side: 'bilateral',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'hip',
    label: 'Cadera',
    side: 'bilateral',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'knee',
    label: 'Rodilla',
    side: 'bilateral',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
  {
    id: 'ankle_foot',
    label: 'Tobillo / Pie',
    side: 'bilateral',
    svgPath: '',
    colors: {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
      default: '#94a3b8',
    },
  },
]

/** Devuelve la definición de una zona por su id */
export function getZoneById(id: ZoneCode): BodyZoneDefinition | undefined {
  return BODY_ZONES.find((z) => z.id === id)
}

/** Zonas centrales (no tienen lado) */
export const CENTRAL_ZONES = BODY_ZONES.filter((z) => z.side === 'central')

/** Zonas bilaterales (tienen lado izquierdo y derecho) */
export const BILATERAL_ZONES = BODY_ZONES.filter((z) => z.side === 'bilateral')
