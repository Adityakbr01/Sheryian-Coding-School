export class ApiResponse<T> {
    public success: boolean;
    public statusCode: number;
    public message: string;
    public data?: T;

    constructor(statusCode: number, message = 'Success', data?: T) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode < 400;
        this.data = data;
    }
}
