import { unauthorized } from "boom";
import { bind } from "decko";
import { Handler, NextFunction, Request, Response } from "express";
import { sign, SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { use } from "passport";
import { ExtractJwt, StrategyOptions } from "passport-jwt";
import { variables } from "../config/globals";
import { permissions } from "../config/permissions";
import { AuthStrategy } from "../modules/auth/auth.strategy";

export class AuthService {
  private readonly strategyOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: variables.secret
  };

  private readonly signOptions: SignOptions = {
    expiresIn: "12h"
  };
  private readonly defaultStrategy: string = "jwt";
  private readonly authStrategy: AuthStrategy = new AuthStrategy(this.strategyOptions);

  public createToken(userId: Types.ObjectId, userType: string): string {
    const payload = { userId, userType };
    return sign(payload, this.strategyOptions.secretOrKey, this.signOptions);
  }

  public initStrategy(): void {
    use("jwt", this.authStrategy.Strategy);
  }

  public hasPermission(resource: string, permission: string): Handler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const uid: number = req.user.id.toString();
        const access: boolean = await permissions.isAllowed(uid, resource, permission);

        if (!access) {
          return next(unauthorized("No tiene los permisos para acceder a este recurso"))
        } else {
          next();
        }
      } catch (e) {
        next(e);
      }
    }
  }

  @bind
  public isAuthorized(strategy?: string): Handler {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const tempStrategy = strategy || this.defaultStrategy;
        return this.doAuthentication(req, res, next, tempStrategy);
      } catch (e) {
        next(e);
      }
    }
  }

  @bind
  private doAuthentication(req: Request, res: Response, next: NextFunction, strategy: string) {
    try {
      return this.authStrategy.isAuthorized(req, res, next);
    } catch (e) {
      next(e);
    }
  }
}