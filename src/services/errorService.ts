import * as Boom from "boom";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class ErrorService {

  public boomErrorHandler(): ErrorRequestHandler {
    return (error: Boom, req: Request, res: Response, next: NextFunction) => {
      if (Boom.isBoom(error) && !res.headersSent) {
        res
          .status(error.output.statusCode)
          .json({
            httpStatus: error.output.statusCode,
            message: error.message,
            status: "error"
          })
      } else {
        next(error);
      }
    }
  }

  public errorHandler(): ErrorRequestHandler {
    const env = process.env.NODE_ENV;
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      if (!res.headersSent) {
        res
          .status(500)
          .json({
            httpStatus: 500,
            message: env === "development" ? error.message : "Error Interno del Servidor. Por favor, vuelva a intentarlo",
            status: "error"
          });
      }
    }
  }
}