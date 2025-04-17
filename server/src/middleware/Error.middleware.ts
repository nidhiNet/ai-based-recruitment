import { NextFunction, Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

interface ErrorCap {
    success: boolean;
    statusCode: number;
    timestamp: number;
    message: string;
    data: null;
    errors: ErrorCapture[];
    [key: string]: any;
};
interface ErrorCapture {
    message: string;
    extensions: ErrorExtension;
    [key: string]: any;
}
interface ErrorExtension {
    code: string;
    stacktrace: ReadonlyArray<string | undefined>;
}

class ErrorMiddleware {
    public static catchGlobalErrors(error: Error, _req: Request, res: Response, _next: NextFunction) {
        const statusCode = (error as any)?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        const response: ErrorCap = {
            success: false,
            statusCode,
            timestamp: Date.now(),
            message: error.message,
            data: null,
            errors: [{
                message: error.message,
                extensions: {
                    code: getReasonPhrase(statusCode),
                    stacktrace: [error.stack]
                },
            }]
        }
        res.status(response.statusCode).send(response);
    }
}

export default ErrorMiddleware;