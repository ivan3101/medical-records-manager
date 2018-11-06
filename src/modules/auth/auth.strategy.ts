import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { authenticate } from "passport";
import { Strategy, StrategyOptions } from "passport-jwt";
import { IPersonal, personalModel } from "../personal/personal.model";
import { IStudent, studentModel } from "../student/student.model";
import { ITempPassword, tempPasswordModel } from "../tempPassword/tempPassword.model";


export class AuthStrategy {
  private readonly Personal: Model<IPersonal> = personalModel;
  private readonly TempPassword: Model<ITempPassword> = tempPasswordModel;
  private readonly strategy: Strategy;

  public constructor(private readonly strategyOptions: StrategyOptions) {
    this.strategy = new Strategy(this.strategyOptions, this.verify);
  }

  public get Strategy(): Strategy {
    return this.strategy;
  }

  @bind
  public isAuthorized(req: Request, res: Response, next: NextFunction) {
    try {
      authenticate("jwt", { session: false }, (error, user, info) => {
        if (error) {
          next(error);
        }

        if (info) {
          switch (info.message) {

            case "No auth token":
              return res
                .status(401)
                .json({
                  httpStatus: 401,
                  message: "Debe iniciar sesión para acceder a este contenido",
                  state: "error"
                });

            case "jwt expired":
              return res
                .status(403)
                .json({
                  httpStatus: 403,
                  message: "Su sesión expiró. Inicie sesión de nuevo para acceder a este contendio",
                  status: "error"
                });
          }
        }

        if (!user) {
          return res
            .status(401)
            .json({
              httpStatus: 401,
              message: "Debe iniciar sesión para acceder a este contenido",
              status: "error"
            });
        }

        req.user = user;

        return next();
      }) (req, res, next)
    } catch (e) {
      next(e);
    }
  }


  @bind
  private async verify(payload, next) {
    try {
      let user;
      if (payload.userType === "profesor" || payload.userType === "archivo") {
        user = await this.Personal.findById(payload.userId);
      } else if (payload.userType === "estudiante") {
        user = await this.TempPassword.findById(payload.userId);
      } else {
        return next(null, false);
      }

      if (!user) {
        return next(null, false);
      }

      return next(null, user);

    } catch (e) {
      return next(e);
    }
  }

}