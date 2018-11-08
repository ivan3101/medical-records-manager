import { unauthorized } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { AuthService } from "../../services/authService";
import { HelperService } from "../../services/helperService";
import { IPersonal, personalModel, } from "../personal/personal.model";
import { ITempPassword, tempPasswordModel } from "../tempPassword/tempPassword.model";

export class AuthController {
  private readonly Personal: Model<IPersonal> = personalModel;
  private readonly TempPassword: Model<ITempPassword> = tempPasswordModel;
  private readonly authService: AuthService = new AuthService();

  @bind
  public async signinPersonal(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const personal = await this.Personal.findOne({
        "active": true,
        "nombreDeUsuario": req.body.personal.nombreDeUsuario,
      });

      if (personal && await HelperService.verifyPassword(personal.contraseña, req.body.personal.contraseña)) {
        const token: string = await this.authService.createToken(personal._id, personal.rol);

        res
          .status(200)
          .json({
            data: {
              personal,
              token
            },
            httpCode: 200,
            message: "Inicio de sesion exitoso",
            state: "successful",
          });
      } else {
        next(unauthorized("Nombre de usuario o Contraseña incorrectos. Por favor, vuelva a intentarlo"));
      }
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async signinTempPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const tempPasswords = (this.TempPassword.find({
        "cedula": req.body.tempPassword.cedula,
        "estado": "Activo"
      }) as any)
        .populate("estudiante")
        .orFail(unauthorized("Cedula del estudiante o clave de acceso incorrectos. Por favor, vuelva a" +
          " intentarlo"));

      for await (const tempPassword of tempPasswords.cursor()) {
        if (await HelperService.verifyPassword(tempPassword.contraseña, req.body.tempPassword.contraseña)) {
          const token = this.authService.createToken(tempPassword._id, "estudiante");

          return res
            .status(200)
            .json({
              data: {
                tempPassword: await tempPassword,
                token
              },
              httpCode: 200,
              message: "Inicio de sesion exitoso",
              status: "successful"
            });
        }
      }

      next (unauthorized("Cedula del estudiante o clave de acceso incorrectos. Por favor, vuelva a" +
        " intentarlo"));

    } catch (e) {
      next(e);
    }
  }
}