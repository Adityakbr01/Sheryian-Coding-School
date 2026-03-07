import { HTTP_STATUS, type HttpStatusCode } from "./httpStatus";

/**
 * Default human-readable messages mapped to each HTTP status code.
 * Used by ApiResponse when no custom message is provided.
 */
export const STATUS_MESSAGES: Record<HttpStatusCode, string> = {
  // 2xx
  [HTTP_STATUS.OK]: "Success",
  [HTTP_STATUS.CREATED]: "Resource created successfully",
  [HTTP_STATUS.NO_CONTENT]: "No content",

  // 4xx
  [HTTP_STATUS.BAD_REQUEST]: "Bad request",
  [HTTP_STATUS.UNAUTHORIZED]: "Unauthorized – please log in",
  [HTTP_STATUS.FORBIDDEN]: "Forbidden – insufficient permissions",
  [HTTP_STATUS.NOT_FOUND]: "Resource not found",
  [HTTP_STATUS.CONFLICT]: "Conflict – resource already exists",
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: "Validation failed",
  [HTTP_STATUS.TOO_MANY_REQUESTS]: "Too many requests – slow down",

  // 5xx
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: "Internal server error",
  [HTTP_STATUS.BAD_GATEWAY]: "Bad gateway",
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: "Service unavailable",
} as const;

/**
 * Look up the default message for a status code.
 * Falls back to "Unknown error" if the code isn't mapped.
 */
export const getStatusMessage = (code: number): string =>
  STATUS_MESSAGES[code as HttpStatusCode] ?? "Unknown error";
