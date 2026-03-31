import type { ZoneCode, ZoneLevel } from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────
// Tabla de orientación clínica por zona y nivel semáforo
// 17 pares zona+nivel (algunas zonas solo tienen ambar/rojo, no verde)
// Textos orientativos — NO son diagnóstico médico
// ─────────────────────────────────────────────────────────────────────────────

export interface PathologyEntry {
  zone_code: ZoneCode
  level: ZoneLevel
  orientation_text: string
  candidate_pathology: string
}

export const PATHOLOGIES: PathologyEntry[] = [
  // CERVICAL
  {
    zone_code: 'cervical',
    level: 'verde',
    orientation_text:
      'Leve tensión muscular cervical sin limitación funcional relevante. Indicado trabajo postural preventivo.',
    candidate_pathology: 'Tensión muscular cervical leve',
  },
  {
    zone_code: 'cervical',
    level: 'ambar',
    orientation_text:
      'Posible alteración cervical con limitación moderada. Puede indicar cervicalgia mecánica o contractura muscular. Recomienda valoración fisioterapéutica.',
    candidate_pathology: 'Cervicalgia mecánica / contractura',
  },
  {
    zone_code: 'cervical',
    level: 'rojo',
    orientation_text:
      'Dolor cervical intenso o con irradiación. Posible hernia discal cervical, radiculopatía o torticolis aguda. Consulta médica prioritaria.',
    candidate_pathology: 'Hernia discal cervical / radiculopatía',
  },

  // DORSAL
  {
    zone_code: 'dorsal',
    level: 'verde',
    orientation_text:
      'Leve tensión dorsal. Frecuente en personas con trabajo sedentario. Ejercicio postural recomendado.',
    candidate_pathology: 'Tensión dorsal postural leve',
  },
  {
    zone_code: 'dorsal',
    level: 'ambar',
    orientation_text:
      'Dolor dorsal moderado. Puede indicar hipercifosis, contractura intercostal o alteración articular. Valoración recomendada.',
    candidate_pathology: 'Dorsalgia mecánica / hipercifosis',
  },
  {
    zone_code: 'dorsal',
    level: 'rojo',
    orientation_text:
      'Dolor dorsal intenso. Descartar costocondritis, hernia discal dorsal o patología visceral referida. Consulta médica urgente.',
    candidate_pathology: 'Hernia discal dorsal / costocondritis',
  },

  // LUMBAR
  {
    zone_code: 'lumbar',
    level: 'verde',
    orientation_text:
      'Molestia lumbar leve sin repercusión funcional significativa. Programa de fortalecimiento core recomendado.',
    candidate_pathology: 'Lumbalgia leve / tensión muscular',
  },
  {
    zone_code: 'lumbar',
    level: 'ambar',
    orientation_text:
      'Lumbalgia moderada con posible limitación funcional. Puede indicar protrusión discal o sobrecarga articular. Fisioterapia recomendada.',
    candidate_pathology: 'Lumbalgia mecánica / protrusión discal',
  },
  {
    zone_code: 'lumbar',
    level: 'rojo',
    orientation_text:
      'Lumbalgia intensa o con irradiación a miembro inferior (posible ciática). Probable hernia discal lumbar. Consulta médica prioritaria.',
    candidate_pathology: 'Hernia discal lumbar / ciática',
  },

  // HOMBRO
  {
    zone_code: 'shoulder',
    level: 'verde',
    orientation_text:
      'Leve tensión periesCAP sin limitación articular. Frecuente en deportistas de lanzamiento. Ejercicio excéntrico preventivo recomendado.',
    candidate_pathology: 'Tensión muscular periescapular leve',
  },
  {
    zone_code: 'shoulder',
    level: 'ambar',
    orientation_text:
      'Dolor de hombro moderado. Posible tendinopatía del manguito, bursitis subacromial o inestabilidad glenohumeral. Valoración fisioterapéutica.',
    candidate_pathology: 'Tendinopatía manguito rotador / bursitis',
  },
  {
    zone_code: 'shoulder',
    level: 'rojo',
    orientation_text:
      'Dolor intenso o limitación severa de movilidad. Posible rotura parcial/total del manguito, capsulitis adhesiva o luxación. Consulta médica urgente.',
    candidate_pathology: 'Rotura manguito / capsulitis adhesiva',
  },

  // CODO
  {
    zone_code: 'elbow',
    level: 'ambar',
    orientation_text:
      'Dolor en codo moderado. Puede indicar epicondilitis lateral (codo de tenista) o medial (codo de golfista). Valoración y ejercicio excéntrico.',
    candidate_pathology: 'Epicondilitis / epitrocleítis',
  },
  {
    zone_code: 'elbow',
    level: 'rojo',
    orientation_text:
      'Dolor intenso en codo o con pérdida de fuerza. Posible rotura tendinosa, atrapamiento nervioso o fractura por estrés. Consulta médica.',
    candidate_pathology: 'Rotura tendinosa / atrapamiento nervioso',
  },

  // MUÑECA / MANO
  {
    zone_code: 'wrist',
    level: 'ambar',
    orientation_text:
      'Dolor en muñeca o mano. Posible tendinitis de De Quervain, síndrome del túnel carpiano leve o esguince. Valoración recomendada.',
    candidate_pathology: 'Tendinitis / túnel carpiano leve',
  },
  {
    zone_code: 'wrist',
    level: 'rojo',
    orientation_text:
      'Dolor intenso, parestesias o pérdida de fuerza en mano. Posible síndrome del túnel carpiano avanzado, artritis o fractura. Consulta médica.',
    candidate_pathology: 'Túnel carpiano severo / artritis',
  },

  // CADERA
  {
    zone_code: 'hip',
    level: 'ambar',
    orientation_text:
      'Dolor en cadera moderado. Puede indicar síndrome de choque femoroacetabular, bursitis trocantérea o tendinopatía glútea. Fisioterapia recomendada.',
    candidate_pathology: 'Choque femoroacetabular / bursitis trocantérea',
  },
  {
    zone_code: 'hip',
    level: 'rojo',
    orientation_text:
      'Dolor intenso de cadera o con cojera. Posible coxartrosis avanzada, fractura de estrés o necrosis avascular. Consulta médica prioritaria.',
    candidate_pathology: 'Coxartrosis / necrosis avascular',
  },

  // RODILLA
  {
    zone_code: 'knee',
    level: 'verde',
    orientation_text:
      'Molestia leve en rodilla sin limitación funcional. Posible sobrecarga por actividad. Programa de fortalecimiento de cuádriceps/isquios recomendado.',
    candidate_pathology: 'Sobrecarga rotuliana leve',
  },
  {
    zone_code: 'knee',
    level: 'ambar',
    orientation_text:
      'Dolor de rodilla moderado. Posible condromalacia rotuliana, tendinopatía rotuliana o meniscopatía leve. Valoración fisioterapéutica.',
    candidate_pathology: 'Condromalacia / tendinopatía rotuliana',
  },
  {
    zone_code: 'knee',
    level: 'rojo',
    orientation_text:
      'Dolor intenso, inestabilidad o bloqueo en rodilla. Posible rotura de ligamento (LCA/LCM), menisco o gonartrosis. Consulta médica urgente.',
    candidate_pathology: 'Rotura ligamentosa / meniscopatía severa',
  },

  // TOBILLO / PIE
  {
    zone_code: 'ankle_foot',
    level: 'ambar',
    orientation_text:
      'Dolor en tobillo o pie moderado. Posible esguince crónico, fascitis plantar o tendinopatía aquílea. Valoración y programa de propiocepción.',
    candidate_pathology: 'Fascitis plantar / tendinopatía aquílea',
  },
  {
    zone_code: 'ankle_foot',
    level: 'rojo',
    orientation_text:
      'Dolor intenso o inestabilidad marcada en tobillo/pie. Posible rotura ligamentosa, fractura por estrés o rotura del tendón de Aquiles. Consulta médica.',
    candidate_pathology: 'Rotura aquílea / fractura por estrés',
  },
]

/** Busca la orientación clínica para una zona y nivel concretos */
export function getPathology(
  zone_code: ZoneCode,
  level: ZoneLevel
): PathologyEntry | undefined {
  return PATHOLOGIES.find(
    (p) => p.zone_code === zone_code && p.level === level
  )
}
