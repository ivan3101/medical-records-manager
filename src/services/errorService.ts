import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class ErrorService {

    public static errorHandler(): ErrorRequestHandler {
        const env = process.env.NODE_ENV;
        return (error: Error, req: Request, res: Response, next: NextFunction) => {
            res
                .status(500)
                .json({
                    message: env === "development" ? error : "Error Interno del Servidor. Vuelva a intentarlo",
                    status: "error"
                })
        }
    }
}