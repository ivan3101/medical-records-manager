import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { default as PasswordGenerator } from "strict-password-generator";
import { HelperService } from "../../services/helperService";
import { ITempPassword, tempPasswordModel } from "./tempPassword.model";

export class TempPasswordController {
  private readonly TempPassword: Model<ITempPassword> = tempPasswordModel;
  private readonly passwordGenerator = new PasswordGenerator();
  private readonly randomPasswordOptions = {
    exactLength: 10
  };

  @bind
  public async createTempPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const newPassword = this.passwordGenerator.generatePassword(this.randomPasswordOptions);
      const newTempPassword = new this.TempPassword({
        ...req.body.tempPassword,
        "contraseña": await HelperService.hashPassword(newPassword)
      });

      await newTempPassword.save();

      res
        .status(201)
        .json({
          data: {
            "contraseña": newPassword
          },
          httpStatus: 201,
          message: "La contraseña ha sido creada correctamente. Ya puede utilizarla para ver la historia medica del" +
            " paciente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }
}