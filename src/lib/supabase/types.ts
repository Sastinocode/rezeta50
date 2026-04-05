// ─────────────────────────────────────────────────────────────────────────────
// MoveMarket — Database types
// Tablas: move_sessions, move_scores, plan_catalog, waitlist
// Compatible con @supabase/supabase-js v2  createClient<Database>
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Enums ────────────────────────────────────────────────────────────────────

export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'expired'

export type ScoreCategory = 'mobility' | 'strength' | 'balance' | 'endurance' | 'overall'

export type PlanTier = 'free' | 'basic' | 'pro'

export type WaitlistStatus = 'waiting' | 'invited' | 'converted'

// ── Database ─────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          name: string
          email: string
          role: 'paciente' | 'profesional' | 'admin'
          created_at: string
        }
        Insert: {
          user_id: string
          name: string
          email: string
          role?: 'paciente' | 'profesional' | 'admin'
          created_at?: string
        }
        Update: {
          name?: string
          email?: string
          role?: 'paciente' | 'profesional' | 'admin'
        }
        Relationships: []
      }
      professionals: {
        Row: {
          id: string
          user_id: string | null
          slug: string
          nombre: string
          especialidad: string
          zona: string
          bio: string | null
          foto_url: string | null
          precio_sesion: number | null
          whatsapp: string | null
          verificado: boolean
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          slug: string
          nombre: string
          especialidad: string
          zona: string
          bio?: string | null
          foto_url?: string | null
          precio_sesion?: number | null
          whatsapp?: string | null
          verificado?: boolean
          activo?: boolean
          created_at?: string
        }
        Update: {
          slug?: string
          nombre?: string
          especialidad?: string
          zona?: string
          bio?: string | null
          foto_url?: string | null
          precio_sesion?: number | null
          whatsapp?: string | null
          verificado?: boolean
          activo?: boolean
        }
        Relationships: []
      }
      move_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_token: string
          status: SessionStatus
          metadata: Json | null
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_token?: string
          status?: SessionStatus
          metadata?: Json | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          status?: SessionStatus
          metadata?: Json | null
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      move_scores: {
        Row: {
          id: string
          session_id: string
          category: ScoreCategory
          score: number
          max_score: number
          percentile: number | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          category: ScoreCategory
          score: number
          max_score?: number
          percentile?: number | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          score?: number
          max_score?: number
          percentile?: number | null
          details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'move_scores_session_id_fkey'
            columns: ['session_id']
            referencedRelation: 'move_sessions'
            referencedColumns: ['id']
          }
        ]
      }
      plan_catalog: {
        Row: {
          id: string
          name: string
          slug: string
          tier: PlanTier
          description: string | null
          features: string[]
          price_eur: number
          price_monthly_eur: number | null
          duration_weeks: number | null
          sessions_per_week: number | null
          harbiz_url: string | null
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          tier: PlanTier
          description?: string | null
          features?: string[]
          price_eur: number
          price_monthly_eur?: number | null
          duration_weeks?: number | null
          sessions_per_week?: number | null
          harbiz_url?: string | null
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          tier?: PlanTier
          description?: string | null
          features?: string[]
          price_eur?: number
          price_monthly_eur?: number | null
          duration_weeks?: number | null
          sessions_per_week?: number | null
          harbiz_url?: string | null
          active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          plan_interest: PlanTier | null
          status: WaitlistStatus
          source: string | null
          notes: string | null
          invited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          plan_interest?: PlanTier | null
          status?: WaitlistStatus
          source?: string | null
          notes?: string | null
          invited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string | null
          phone?: string | null
          plan_interest?: PlanTier | null
          status?: WaitlistStatus
          source?: string | null
          notes?: string | null
          invited_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      session_status: SessionStatus
      score_category: ScoreCategory
      plan_tier: PlanTier
      waitlist_status: WaitlistStatus
    }
  }
}
