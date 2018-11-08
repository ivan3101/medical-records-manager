import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { IMedicalRecord, medicalRecordModel } from "../medicalRecord/medicalRecord.model";
import { ITriage, triageModel } from "../triage/triage.model";
import { IOnHold, onHoldModel } from "./onHold.model";

export class OnHoldController {
  private readonly OnHold: Model<IOnHold> = onHoldModel;
  private readonly Triage: Model<ITriage> = triageModel;
  private readonly MedicalRecord: Model<IMedicalRecord> = medicalRecordModel;

  @bind
  public async createOnHold(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      let promise = null;
      if (!req.body.enEspera.modificacion) {
        if (req.body.enEspera.tipo === "triaje") {
          promise = this.Triage.findOne({
            "active": true,
            "paciente": req.body.enEspera.paciente
          });

        } else if (req.body.enEspera.tipo === "historia principal") {
          promise = this.MedicalRecord.findOne({
            "active": true,
            "paciente": req.body.enEspera.paciente
          });
        }
      }
      const newOnHold = new this.OnHold(req.body.enEspera);

      if (await promise) {
        next(badRequest(`Este paciente ya cuenta con este tipo de documento. Si esta tratando de agregar una modificacíón, seleccione Modificacion en el menu`));
      }

      await newOnHold.save();

      res
        .status(201)
        .json({
          httpCode: 201,
          message: "Documento agregado a la lista de espera correctamente. En espera de revision por parte de un" +
            " Profesor",
          state: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllOnHolds(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 9;
      const status = req.query.status || "En espera";

      const onHolds = await (this.OnHold.find({
        "active": true,
        "estado": status,
      })
        .skip(offset)
        .limit(limit) as any)
        .orFail(notFound(`No hay documentos ${status}`));

      res
        .status(200)
        .json({
          data: {
            enEspera: onHolds
          },
          httpCode: 200,
          message: "Documentos encontrados satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async approveOnHoldNew(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.onholdId;
      const professorId = req.params.professorId;

      const onHold = await (this.OnHold
        .findOneAndUpdate({
          "_id": onHoldId,
          "active": true,
          "estado": "En espera",
          "profesor": professorId
        }, {
          $set: {
            "estado": "Aprobado"
          }
        }, { new: true }) as any)
        .orFail(notFound("El documento en espera no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      if (onHold.tipo === "triaje") {
        const newTriage = new this.Triage(onHold.toJSON);
        newTriage.numeroDeHistoria = await (this.Triage as any).setRecordNumber();
        newTriage.fechaDeAprobacion = new Date();
        await newTriage.save();

      } else {
        const newMedicalRecord = new this.MedicalRecord(onHold.toJSON);
        newMedicalRecord.fechaDeAprobacion = new Date();
        await newMedicalRecord.save();
      }

      res
        .status(201)
        .json({
          httpCode: 201,
          message: "Documente aprobado con exito",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async approveOnHoldMod(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.onholdId;
      const professorId = req.params.professorId;

      const onHold = await (this.OnHold
        .findOneAndUpdate({
          "_id": onHoldId,
          "active": true,
          "estado": "En espera",
          "profesor": professorId
        }, {
          $set: {
            "estado": "Aprobado"
          }
        }, { new: true }) as any)
        .orFail(notFound("El documento en espera no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      if (onHold.tipo === "triaje") {
        const actualTriage = await (this.Triage.find({
          "paciente": onHold.paciente
        }) as any).orFail(notFound("El triaje no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

        (actualTriage as any).modificaciones.push({
          ...onHold,
          fechaDeAprobacion: new Date()
        });

       await actualTriage.save();

      } else {
        const actualMedicalRecord = await (this.MedicalRecord.find({
          "paciente": onHold.paciente
        }) as any).orFail(notFound("El triaje no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

        (actualMedicalRecord as any).modificaciones.push({
          ...onHold,
          fechaDeAprobacion: new Date()
        });

        await actualMedicalRecord.save();
      }

      res
        .status(201)
        .json({
          httpCode: 201,
          message: "Documento aprobado exitosamente",
          status: "successful"
        });

    } catch (e) {
      next(e);
    }
  }

  @bind
  public async rejectOnHold(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.onholdId;
      const professorId = req.params.professorId;

      const onHoldUpdated = await (this.OnHold
        .findOneAndUpdate({
          "_id": onHoldId,
          "active": true,
          "estado": "En espera",
          "professorId": professorId
        }, {
          $set: { "estado": "Rechazado" }
        }, { new: true }) as any)
        .orFail(notFound("El document no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "El documento ha sido rechazado con exito",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldsByProfessor(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 9;
      const professorId = req.params.professorId;

      const onHolds = await (this.OnHold.find({
        "active": true,
        "estado": "En espera",
        "profesor": professorId
      })
        .skip(offset)
        .limit(limit) as any)
        .orFail(notFound(`No hay documentos ${status}`));

      res
        .status(200)
        .json({
          data: {
            enEspera: onHolds
          },
          httpCode: 200,
          message: "Documentos encontrados satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const onHold = await (this.OnHold
        .findOne({
          "_id": onHoldId,
          "active": true
        }) as any)
        .orFail(notFound("El document no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      res
        .status(200)
        .json({
          data: {
            enEspera: onHold
          },
          httpCode: 200,
          message: "El documento ha sido encontrado satisfactoriamente",
          status: "successful"
        });

    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyOnHold(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.onholdId;
      const studentId = req.params.studenId;
      const onHoldModified = await (this.OnHold
        .findOneAndUpdate({
          "_id": onHoldId,
          "active": true,
          "estado": "Rechazado",
          "estudiante": studentId
        }, {
          $set: {
            "document": req.body.enEspera.documento,
            "estado": "En espera"
          }
        }, { new: true }) as any)
        .orFail(notFound("El documento no ha sido encontrado. Si esta seguro de que el documento existe, vuelva a" +
          " intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Documento actualizado correctamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deleteOnHold(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const onHoldModified = await (this.OnHold
        .findOneAndUpdate({
          "_id": onHoldId,
          "active": true,
        }, {
          $set: {
            "active": false
          }
        }, { new: true }) as any)
        .orFail(notFound("El documento no ha sido encontrado. Si esta seguro de que el documento existe, vuelva a" +
          " intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Documento actualizado correctamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldsByStudent(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 9;
      const status = req.query.status || "En espera";
      const studentId = req.params.studentId;

      const onHolds = await (this.OnHold.find({
        "active": true,
        "estado": status,
        "student": studentId
      })
        .skip(offset)
        .limit(limit) as any)
        .orFail(notFound(`No hay documentos ${status}`));

      res
        .status(200)
        .json({
          data: {
            enEspera: onHolds
          },
          httpCode: 200,
          message: "Documentos encontrados satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldByStudent(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const studentId = req.params.studentId;
      const status = req.query.status || "En espera";

      const onHold = await (this.OnHold
        .findOne({
          "_id": onHoldId,
          "active": true,
          "estado": status,
          "estudiante": studentId
        }) as any)
        .orFail(notFound("El document no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      res
        .status(200)
        .json({
          data: {
            enEspera: onHold
          },
          httpCode: 200,
          message: "El documento ha sido encontrado satisfactoriamente",
          status: "successful"
        });

    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldByProfessor(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.onholdId;
      const professorId = req.params.professorId;

      const onHold = await (this.OnHold
        .findOne({
          "_id": onHoldId,
          "active": true,
          "estado": "En espera",
          "profesor": professorId
        }) as any)
        .orFail(notFound("El document no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      res
        .status(200)
        .json({
          data: {
            enEspera: onHold
          },
          httpCode: 200,
          message: "El documento ha sido encontrado satisfactoriamente",
          status: "successful"
        });

    } catch (e) {
      next(e);
    }
  }
}