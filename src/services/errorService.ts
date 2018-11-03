import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class ErrorService {

    public static errorHandler(): ErrorRequestHandler {
        return (error: Error, req: Request, res: Response, next: NextFunction) => {
            res.status(500).json({
                message: error.message,
                status: 'error'
            })
        }
    }
}