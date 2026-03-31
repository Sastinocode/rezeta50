// ─────────────────────────────────────────────────────────────────────────────
// Tipos de base de datos — Rezeta 50
// Estructura compatible con @supabase/supabase-js v2
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums exportados (uso en la app) ─────────────────────────────────────────

export type ZoneCode =
  | 'cervical'
  | 'dorsal'
  | 'lumbar'
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'hip'
  | 'knee'
  | 'ankle_foot'

export type ZoneSide = 'r' | 'l' | null

export type ZoneLevel = 'verde' | 'ambar' | 'rojo'

/** Nivel global del informe (4 niveles clínicos) */
export type GlobalLevel = 'preventivo' | 'atencion' | 'rehabilitador' | 'derivacion'

export type QuestionnaireStatus = 'draft' | 'completed'

export type ProgramPhase = 'prehab' | 'rehab_fase1' | 'rehab_fase2'

// ── Tipo Json compatible con Supabase ─────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Tipos de dominio (para usar en la app, no en el DB client) ───────────────

export interface ZoneResult {
  zone_code: ZoneCode
  side: ZoneSide
  score: number
  level: ZoneLevel
  orientation: string
  candidate_pathology: string
  red_flags: string[]
}

export interface RedFlagResult {
  id: string
  zone: string
  message: string
}

export interface ProgramSnapshot {
  id: string
  name: string
  description: string | null
  phase: string
  level: string
  price_eur: number
  duration_weeks: number
  sessions_week: number
  harbiz_url: string
  match_score: number
}

export interface ReportData {
  global_score: number
  global_level: GlobalLevel
  zone_results: ZoneResult[]
  recommended_programs: string[]
  program_snapshots: ProgramSnapshot[]
  red_flags: RedFlagResult[]
  generated_at: string
}

// ── Database — estructura compatible con createClient<Database> ───────────────

export interface Database {
  public: {
    Tables: {
      questionnaires: {
        Row: {
          id: string
          user_id: string
          status: 'draft' | 'completed'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'draft' | 'completed'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'draft' | 'completed'
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      body_zones: {
        Row: {
          id: string
          questionnaire_id: string
          zone_code: ZoneCode
          side: 'r' | 'l' | null
          created_at: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          zone_code: ZoneCode
          side?: 'r' | 'l' | null
          created_at?: string
        }
        Update: {
          zone_code?: ZoneCode
          side?: 'r' | 'l' | null
        }
        Relationships: [
          {
            foreignKeyName: 'body_zones_questionnaire_id_fkey'
            columns: ['questionnaire_id']
            referencedRelation: 'questionnaires'
            referencedColumns: ['id']
          }
        ]
      }
      zone_answers: {
        Row: {
          id: string
          body_zone_id: string
          question_key: string
          answer_value: string
          created_at: string
        }
        Insert: {
          id?: string
          body_zone_id: string
          question_key: string
          answer_value: string
          created_at?: string
        }
        Update: {
          question_key?: string
          answer_value?: string
        }
        Relationships: [
          {
            foreignKeyName: 'zone_answers_body_zone_id_fkey'
            columns: ['body_zone_id']
            referencedRelation: 'body_zones'
            referencedColumns: ['id']
          }
        ]
      }
      global_answers: {
        Row: {
          id: string
          questionnaire_id: string
          question_key: string
          answer_value: string
          created_at: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          question_key: string
          answer_value: string
          created_at?: string
        }
        Update: {
          question_key?: string
          answer_value?: string
        }
        Relationships: [
          {
            foreignKeyName: 'global_answers_questionnaire_id_fkey'
            columns: ['questionnaire_id']
            referencedRelation: 'questionnaires'
            referencedColumns: ['id']
          }
        ]
      }
      reports: {
        Row: {
          id: string
          questionnaire_id: string
          user_id: string
          report_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          user_id: string
          report_data: Json
          created_at?: string
        }
        Update: {
          report_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'reports_questionnaire_id_fkey'
            columns: ['questionnaire_id']
            referencedRelation: 'questionnaires'
            referencedColumns: ['id']
          }
        ]
      }
      programs: {
        Row: {
          id: string
          name: string
          description: string | null
          zone_codes: ZoneCode[]
          level: 'verde' | 'ambar' | 'rojo'
          phase: 'prehab' | 'rehab_fase1' | 'rehab_fase2'
          harbiz_url: string
          price_eur: number
          duration_weeks: number
          sessions_week: number
          floor_required: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          zone_codes: ZoneCode[]
          level: 'verde' | 'ambar' | 'rojo'
          phase: 'prehab' | 'rehab_fase1' | 'rehab_fase2'
          harbiz_url: string
          price_eur: number
          duration_weeks: number
          sessions_week: number
          floor_required?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          zone_codes?: ZoneCode[]
          level?: 'verde' | 'ambar' | 'rojo'
          phase?: 'prehab' | 'rehab_fase1' | 'rehab_fase2'
          harbiz_url?: string
          price_eur?: number
          duration_weeks?: number
          sessions_week?: number
          floor_required?: boolean
          active?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          role?: 'admin' | 'user'
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      zone_code: ZoneCode
      zone_side: 'r' | 'l'
      zone_level: 'verde' | 'ambar' | 'rojo'
      questionnaire_status: 'draft' | 'completed'
      program_phase: 'prehab' | 'rehab_fase1' | 'rehab_fase2'
    }
  }
}
