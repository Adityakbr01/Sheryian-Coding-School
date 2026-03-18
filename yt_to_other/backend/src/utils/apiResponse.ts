import { Response } from 'express';

export class ApiResponse {
    constructor(
        public statusCode: number,
        public message: string,
        public data: any = null,
        public success: boolean = true
    ) { }

    static send(res: Response, statusCode: number, message: string, data: any = null) {
        const success = statusCode >= 200 && statusCode < 300;
        return res.status(statusCode).json({
            success,
            statusCode,
            message,
            data
        });
    }

    static success(res: Response, message: string = 'Success', data: any = null, statusCode: number = 200) {
        return this.send(res, statusCode, message, data);
    }

    static error(res: Response, message: string = 'Internal Server Error', statusCode: number = 500, errors: any = null) {
        return res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            errors
        });
    }
}
