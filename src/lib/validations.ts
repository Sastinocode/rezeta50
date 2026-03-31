import { z } from "zod";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const firstError = result.error.errors[0];
  return {
    success: false,
    error: firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Validation failed",
  };
}

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .trim(),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string({ required_error: "Please confirm your password" }),
    role: z.enum(["ATHLETE", "COACH"], { required_error: "Please select a role" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

// ─── Athlete Profile schema ───────────────────────────────────────────────────

export const athleteProfileSchema = z.object({
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const now = new Date();
      const minAge = new Date();
      minAge.setFullYear(now.getFullYear() - 80);
      const maxAge = new Date();
      maxAge.setFullYear(now.getFullYear() - 10);
      return date >= minAge && date <= maxAge;
    }, "Age must be between 10 and 80 years"),
  sport: z.string().max(50, "Sport name too long").optional(),
  position: z.string().max(50, "Position name too long").optional(),
  height: z.number().min(100, "Min 100cm").max(250, "Max 250cm").optional(),
  weight: z.number().min(30, "Min 30kg").max(300, "Max 300kg").optional(),
  dominantSide: z.enum(["LEFT", "RIGHT", "BILATERAL"]).optional(),
});

// ─── Evaluation schema ────────────────────────────────────────────────────────

export const evaluationResponseSchema = z.object({
  questionId: z.string().min(1),
  value: z.number().int().min(0).max(4),
  label: z.string().max(100),
});

export const evaluationSchema = z.object({
  type: z.enum(["MHQ", "AHQ"]),
  responses: z
    .array(evaluationResponseSchema)
    .min(1, "At least one response is required")
    .max(20, "Too many responses"),
  notes: z.string().max(1000, "Notes too long").optional(),
});

// ─── Body Map schema ──────────────────────────────────────────────────────────

const VALID_BODY_PARTS = [
  "head", "neck", "left_shoulder", "right_shoulder",
  "left_arm", "right_arm", "left_forearm", "right_forearm",
  "left_hand", "right_hand", "chest", "upper_back",
  "abdomen", "lower_back", "left_hip", "right_hip",
  "left_thigh", "right_thigh", "left_knee", "right_knee",
  "left_calf", "right_calf", "left_ankle", "right_ankle",
  "left_foot", "right_foot",
] as const;

export const bodyMapEntrySchema = z.object({
  bodyPart: z.enum(VALID_BODY_PARTS, { errorMap: () => ({ message: "Invalid body part" }) }),
  side: z.enum(["LEFT", "RIGHT", "BILATERAL"]).optional().default("BILATERAL"),
  painLevel: z.number().int().min(1, "Min pain level is 1").max(10, "Max pain level is 10"),
  painType: z.enum(["SHARP", "DULL", "ACHING", "BURNING", "THROBBING"]).optional().default("DULL"),
  notes: z.string().max(500, "Notes too long").optional(),
});

// ─── Program schema ───────────────────────────────────────────────────────────

export const programExerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(200).optional(),
  duration: z.number().int().min(1).max(3600).optional(),
  weight: z.number().min(0).max(1000).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(200).optional(),
});

export const programSchema = z
  .object({
    name: z.string().min(3, "Program name too short").max(100, "Program name too long"),
    athleteId: z.string().cuid("Invalid athlete ID"),
    exercises: z
      .array(programExerciseSchema)
      .min(1, "At least one exercise is required")
      .max(50, "Too many exercises"),
    startDate: z.string().datetime({ message: "Invalid start date" }),
    endDate: z.string().datetime({ message: "Invalid end date" }).optional(),
    notes: z.string().max(2000, "Notes too long").optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

// ─── Session schema ───────────────────────────────────────────────────────────

export const sessionSetSchema = z.object({
  reps: z.number().int().min(0).max(200),
  weight: z.number().min(0).max(1000).optional(),
  completed: z.boolean(),
});

export const sessionExerciseSchema = z.object({
  exerciseId: z.string(),
  name: z.string().max(100),
  sets: z.array(sessionSetSchema).max(20),
});

export const programSessionSchema = z.object({
  duration: z.number().int().min(1, "Min 1 minute").max(480, "Max 8 hours").optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
  exercises: z.array(sessionExerciseSchema).max(50),
});

// ─── Date range schema ────────────────────────────────────────────────────────

export const dateRangeSchema = z.object({
  days: z.coerce.number().pipe(z.union([z.literal(7), z.literal(14), z.literal(30), z.literal(90)])),
});
