import { Response } from "express";

export class ApiResponse {

  static success<T>(
    res: Response,
    statusCode: number = 200,
    message: string = "Success",
    data?: T
  ) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  static error(
    res: Response,
    statusCode: number = 500,
    message: string = "Something went wrong"
  ) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }
}