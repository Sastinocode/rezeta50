import type { UserRole, PainType, BodySide, EvaluationType, ProgramStatus, DominantSide } from "@prisma/client";

// ─── Auth ───────────────────────────────────────────────────────────────────

export type { UserRole };

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

// ─── Athlete Profile ─────────────────────────────────────────────────────────

export interface AthleteProfileData {
  userId: string;
  dateOfBirth?: string | null;
  sport?: string | null;
  position?: string | null;
  height?: number | null;
  weight?: number | null;
  dominantSide?: DominantSide | null;
  injuryHistory?: InjuryRecord[] | null;
}

export interface InjuryRecord {
  date: string;
  bodyPart: string;
  description: string;
  recovered: boolean;
}

// ─── Evaluations ─────────────────────────────────────────────────────────────

export interface EvaluationQuestion {
  id: string;
  category: string;
  text: string;
  maxScore: number;
  options: { value: number; label: string; description: string }[];
}

export interface EvaluationResponse {
  questionId: string;
  value: number;
  label: string;
}

export interface Evaluation {
  id: string;
  athleteId: string;
  coachId?: string | null;
  type: EvaluationType;
  responses: EvaluationResponse[];
  score: number;
  notes?: string | null;
  createdAt: string;
}

// ─── Body Map ─────────────────────────────────────────────────────────────────

export type BodyPartKey =
  | "head" | "neck" | "left_shoulder" | "right_shoulder"
  | "left_arm" | "right_arm" | "left_forearm" | "right_forearm"
  | "left_hand" | "right_hand" | "chest" | "upper_back"
  | "abdomen" | "lower_back" | "left_hip" | "right_hip"
  | "left_thigh" | "right_thigh" | "left_knee" | "right_knee"
  | "left_calf" | "right_calf" | "left_ankle" | "right_ankle"
  | "left_foot" | "right_foot";

export interface BodyMapEntryData {
  id: string;
  athleteId: string;
  bodyPart: BodyPartKey;
  side: BodySide;
  painLevel: number;
  painType: PainType;
  notes?: string | null;
  createdAt: string;
}

export interface PainMapData {
  [bodyPart: string]: number; // average pain level per body part
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  weight?: number; // kg
  restSeconds?: number;
  notes?: string;
  videoUrl?: string;
}

export interface Program {
  id: string;
  name: string;
  athleteId: string;
  coachId?: string | null;
  status: ProgramStatus;
  exercises: ProgramExercise[];
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  sessionsCount?: number;
}

export interface SessionExerciseLog {
  exerciseId: string;
  name: string;
  sets: { reps: number; weight?: number; completed: boolean }[];
}

export interface ProgramSessionData {
  id: string;
  programId: string;
  athleteId: string;
  completedAt: string;
  duration?: number | null;
  notes?: string | null;
  exercises: SessionExerciseLog[];
}

// ─── Dashboard & Reports ──────────────────────────────────────────────────────

export interface RecentEvaluationSummary {
  id: string;
  type: string;
  score: number;
  createdAt: string;
}

export interface RecentSessionSummary {
  id: string;
  programName?: string;
  rpe?: number;
  completedAt: string;
}

export interface DashboardStats {
  totalEvaluations: number;
  averagePainLevel: number | null;
  activePrograms: number;
  completedSessions: number;
  painTrend: PainTrendPoint[];
  recentActivity: ActivityItem[];
  recentEvaluations?: RecentEvaluationSummary[];
  recentSessions?: RecentSessionSummary[];
}

export interface PainTrendPoint {
  date: string;
  avg: number;
  entries: number;
}

export interface ActivityItem {
  id: string;
  type: "evaluation" | "body_map" | "session" | "program";
  title: string;
  description: string;
  timestamp: string;
  score?: number;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}
