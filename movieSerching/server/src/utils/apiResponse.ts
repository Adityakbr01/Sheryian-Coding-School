import { Response } from "express";
import { HTTP_STATUS } from "@/constants/httpStatus";
import { getStatusMessage } from "@/constants/statusMessages";

interface ApiResponsePayload<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, any>;
}

export class ApiResponse {
  /**
   * Send a success response
   */
  static success<T = any>(
    res: Response,
    {
      statusCode = HTTP_STATUS.OK,
      message,
      data,
      meta,
    }: {
      statusCode?: number;
      message?: string;
      data?: T;
      meta?: Record<string, any>;
    } = {}
  ): void {
    const payload: ApiResponsePayload<T> = {
      success: true,
      statusCode,
      message: message ?? getStatusMessage(statusCode),
    };
    if (data !== undefined) payload.data = data;
    if (meta) payload.meta = meta;

    res.status(statusCode).json(payload);
  }

  /**
   * 200 OK
   */
  static ok<T = any>(
    res: Response,
    data?: T,
    message?: string
  ): void {
    ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message,
      data,
    });
  }

  /**
   * 201 Created
   */
  static created<T = any>(
    res: Response,
    data?: T,
    message?: string
  ): void {
    ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message,
      data,
    });
  }

  /**
   * 204 No Content
   */
  static noContent(res: Response, message?: string): void {
    res.status(HTTP_STATUS.NO_CONTENT).json({
      success: true,
      statusCode: HTTP_STATUS.NO_CONTENT,
      message: message ?? getStatusMessage(HTTP_STATUS.NO_CONTENT),
    });
  }

  /**
   * Paginated response with meta info
   */
  static paginated<T = any>(
    res: Response,
    data: T,
    pagination: { page: number; limit: number; total: number; totalPages: number },
    message?: string
  ): void {
    ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message,
      data,
      meta: { pagination },
    });
  }

  /**
   * Error response (used by globalErrorHandler, but also available directly)
   */
  static error(
    res: Response,
    {
      statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      stack,
    }: {
      statusCode?: number;
      message?: string;
      stack?: string;
    } = {}
  ): void {
    const payload: Record<string, any> = {
      success: false,
      statusCode,
      message: message ?? getStatusMessage(statusCode),
    };
    if (process.env.NODE_ENV === "development" && stack) {
      payload.stack = stack;
    }
    res.status(statusCode).json(payload);
  }
}
