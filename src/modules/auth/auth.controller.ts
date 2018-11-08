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
      const personal = await (this.Personal.findOne({
        "nombreDeUsuario": req.body.personal.nombreDeUsuario
      }) as any).orFail(unauthorized("Nombre de usuario o Contraseña incorrectos. Por favor, vuelva a intentarlo"));

      if (await HelperService.verifyPassword(personal.contraseña, req.body.personal.contraseña)) {
        const token: string = this.authService.createToken(personal._id, personal.rol);

        res
          .status(res.statusCode)
          .json({
            data: {
              personal,
              token: await token
            },
            httpCode: res.statusCode,
            message: "Inicio de sesion exitoso",
            state: "successful",
          })
      } else {
        throw (unauthorized("Nombre de usuario o Contraseña incorrectos. Por favor, vuelva a intentarlo"));
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
            .status(res.statusCode)
            .json({
              data: {
                tempPassword: await tempPassword,
                token
              },
              httpCode: res.statusCode,
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