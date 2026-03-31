import { NextResponse } from "next/server";

// ─── Error Codes ──────────────────────────────────────────────────────────────

export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  CONFLICT: "CONFLICT",
  BAD_REQUEST: "BAD_REQUEST",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ─── AppError ─────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: ErrorCode, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Predefined errors ────────────────────────────────────────────────────────

export const Errors = {
  unauthorized: () => new AppError("Authentication required.", ErrorCode.UNAUTHORIZED, 401),
  forbidden: (msg = "You do not have permission to perform this action.") =>
    new AppError(msg, ErrorCode.FORBIDDEN, 403),
  notFound: (resource = "Resource") =>
    new AppError(`${resource} not found.`, ErrorCode.NOT_FOUND, 404),
  conflict: (msg = "A resource with these details already exists.") =>
    new AppError(msg, ErrorCode.CONFLICT, 409),
  validation: (msg: string) => new AppError(msg, ErrorCode.VALIDATION_ERROR, 400),
  rateLimit: () =>
    new AppError("Too many requests. Please try again later.", ErrorCode.RATE_LIMIT_EXCEEDED, 429),
  internal: () =>
    new AppError("An unexpected error occurred. Please try again.", ErrorCode.INTERNAL_ERROR, 500),
};

// ─── Error response factory ───────────────────────────────────────────────────

export function createErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Prisma unique constraint violation
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    return NextResponse.json(
      { error: "A record with these details already exists.", code: ErrorCode.CONFLICT },
      { status: 409 }
    );
  }

  // Never leak internals in production
  const isDev = process.env.NODE_ENV === "development";
  const message = isDev && error instanceof Error ? error.message : "An unexpected error occurred.";

  return NextResponse.json(
    { error: message, code: ErrorCode.INTERNAL_ERROR },
    { status: 500 }
  );
}

export function handleApiError(error: unknown): NextResponse {
  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]", error);
  } else {
    // In production log only non-sensitive info
    if (error instanceof AppError) {
      console.error(`[API Error] ${error.code}: ${error.message}`);
    } else {
      console.error("[API Error] Unexpected error occurred");
    }
  }
  return createErrorResponse(error);
}
