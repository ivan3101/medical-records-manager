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
      active: true,
      "email": req.body.personal.email
    }) as any;

    const username = this.Personal.findOne({
      active: true,
      "nombreDeUsuario": req.body.personal.nombreDeUsuario
    }) as any;

    const cedula = this.Personal.findOne({
      active: true,
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
          "active": true,
          rol: {$ne: "admin"}
        })
        .select("-contraseña") as any)
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
      const startindex = req.query.startIndex || null;
      const limit = 46;

      let personal;

      if (startindex) {
        personal = await this.Personal.find({
          active: true,
          nombre: { $gte: startindex },
          rol: {$ne: "admin"}
        })
          .sort("nombre")
          .limit(limit);
      } else {
        personal = await this.Personal
          .find({
            active: true,
            rol: {$ne: "admin"}
          })
          .sort("nombre")
          .limit(limit);
      }

      const nextStartIndex = personal.length < limit ? null : personal[personal.length - 1].nombre;

      return res
        .status(200)
        .json({
          data: {
            personals: personal.slice(0, limit - 1),
            startindex: nextStartIndex
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

      const changes = Object.assign({}, req.body.personal);

      if (req.body.personal.contraseña) {
        changes.contraseña = await HelperService.hashPassword(req.body.personal.contraseña);
      } else {
        delete changes.contraseña;
      }

      const modifiedPersonal = await (this.Personal
        .findOneAndUpdate({
          "_id": personalId,
          "active": true,
          rol: { $ne: "admin"}
        }, {
          $set: {
            ...changes
          }
        }, { new: true }) as any)
        .orFail(notFound("No se encontro al miembro del Personal. Si esta seguro de que el miembro del Personal" + "existe en el sistema, por favor vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "El miembro del personal se ha actualizado correctamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async filterPersonal(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const matchText: string = req.query.matchText;

      (this.Personal as any)
        .search({
          match: {
            nombre: {
              fuzziness: "AUTO",
              max_expansions: 200,
              prefix_length: 0,
              query: matchText
            }
          }
      },{
          hydrate: false
        }, (err, filteredPersonal) => {
          if (err) {
            return next(err);
          }

          res
            .status(200)
            .json({
              data: {
                personal: filteredPersonal.hits.hits
              }
            })
        });


    } catch (e) {
      next(e);
    }
  }

}