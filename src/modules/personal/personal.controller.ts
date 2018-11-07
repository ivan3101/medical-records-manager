import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { HelperService } from "../../services/helperService";
import { IPersonal, personalModel } from "./personal.model";

export class PersonalController {

  private readonly Personal: Model<IPersonal> = personalModel;

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

  @bind
  public async deletePersonal(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const personalId = req.params.id;
      const deletedPersonal = await (this.Personal
        .findByIdAndUpdate(personalId, {
          $set: {
            "active": false
          }
        }, { new: true }) as any)
        .orFail(notFound("No se encontro al miembro del Personal. Si esta seguro de que el miembro del Personal existe en el sistema, por favor vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Miembro del personal eliminado correctamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getPersonalById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const personalId = req.params.id;
      const personal = await (this.Personal
        .findOne({
          "_id": personalId,
          "active": true
        }) as any)
        .orFail(notFound("No se encontro al miembro del Personal. Si esta seguro de que el miembro del Personal" +
          " existe en el sistema, por favor vuelva a intentarlo"));

      res
        .status(200)
        .json({
          data: {
            personal
          },
          httpCode: 200,
          message: "Miembro del personal encontrado satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllPersonals(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 9;
      const personals = await (this.Personal
        .find({
          "active": true
        })
        .skip(offset)
        .limit(limit) as any)
        .orFail(notFound("No se encontro ningun miembro del Personal"));

      res
        .status(200)
        .json({
          data: {
            personal: personals
          },
          httpCode: 200,
          message: "Miembros del personal encontrados satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyPersonal(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const personalId = req.params.id;
      const modifiedPersonal = await (this.Personal
        .findOneAndUpdate({
          "_id": personalId,
          "active": true
        }, {
          $set: {
            ...req.body.personal
          }
        }, { new: true }) as any)
        .orFail(notFound("No se encontro al miembro del Personal. Si esta seguro de que el miembro del Personal" + "existe en el sistema, por favor vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "El miembro del persona se ha actualizado correctamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

}