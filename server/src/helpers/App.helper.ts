import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { catchErrors } from "@/utils/utils.fn";

class AppHelper {
    public static async serverErrorHandler(error: NodeJS.ErrnoException) {
        if (error.syscall !== "listen") {
            throw error;
        }
        switch (error.code) {
            case "EACCES":
                console.warn("Require privileges");
                break;

            case "EACCES":
                console.error(`${parseInt(process.env.PORT as string, 10) || 3010} port is already in use`);
                break;

            default:
                throw error;
        }
    }

    public static notRoute = (req: Request, res: Response, next: NextFunction) => {
        next(catchErrors(StatusCodes.NOT_FOUND, "Request resource not found!!"))
    }
};

export default AppHelper;