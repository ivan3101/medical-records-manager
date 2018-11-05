import {badRequest} from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { HelperService } from "../../services/helperService";
import { IPersonal, PersonalModel } from "./personal.model";

export class PersonalController {

  private readonly Personal: Model<IPersonal> = new PersonalModel().Model;

  @bind
  public async addPersonal(req: Request, res: Response, next: NextFunction): Promise<any> {

    const email = this.Personal.findOne({
      "email": req.body.personal.email
    }) as any;

    const username = this.Personal.findOne({
      "nombreDeUsuario": req.body.personal.nombreDeUsuario
    }) as any;

    const cedula = this.Personal.findOne({
      "cedula": req.body.personal.cedula
    }) as any;

    const promises = await Promise.all([email, username, cedula]);

    if (promises[0]) {
      next(badRequest("Ya se encuentra registrado un miembro del personal con ese email. Por favor, elija otro y" +
        " vuelva a intentarlo"));

    } else if (promises[1]) {
      next(badRequest("Ya se encuentra registrado un miembro del personal con ese nombre de usuario. Por favor," +
        " elija otro y vuelva a intentarlo"));
    } else if (promises[2]) {
      next(badRequest("Ya se encuentra registrado un miembro del personal con esa cedula"));
      
    } else {
      const newPersonal = new this.Personal({
        ...req.body.personal,
        contraseña: await HelperService.hashPassword(req.body.personal.contraseña)
      });

      await newPersonal.save();

      res
        .status(201)
        .json({
          httpStatus: 201,
          message: "El miembro del personal ha sido agregado exitosamente al sistema",
          status: "successful"
        });
    }
  }


}