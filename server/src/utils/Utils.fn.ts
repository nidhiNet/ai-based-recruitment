import { StatusCodes } from "http-status-codes";

const catchErrors = (statusCode = StatusCodes.INTERNAL_SERVER_ERROR, message: string) => {
    const err = new Error(message) as any;
    err.statusCode = statusCode;
    return err;
};

export {
    catchErrors
}