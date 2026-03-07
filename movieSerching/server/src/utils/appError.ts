import { getStatusMessage } from "@/constants/statusMessages";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string | undefined, statusCode: number) {
    super(message ?? getStatusMessage(statusCode));
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (
  fn: (req: any, res: any, next: any) => Promise<any>
) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};
