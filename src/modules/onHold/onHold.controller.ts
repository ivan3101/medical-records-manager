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
      const newOnHold = new this.OnHold(req.body.onHold);

      await newOnHold.save();

      res
        .status(201)
        .json({
          httpCode: 201,
          message: "Documento agregado a la lista de espera correctamen. En espera de revision por parte de un" +
            " Profesor",
          state: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async approveOnHoldNew(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.id;

      const onHold = await (this.OnHold
        .findById(onHoldId) as any)
        .orFail(notFound("El documento en espera no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      onHold.estado = "Aprobado";
      const promises = [onHold.save()];

      if (onHold.tipo === "triaje") {
        const newTriage = new this.Triage(onHold.toJSON);
        newTriage.numeroDeHistoria = await (this.Triage as any).setRecordNumber();
        newTriage.fechaDeAprobacion = new Date();
        promises.push(newTriage.save());

      } else {
        const newMedicalRecord = new this.MedicalRecord(onHold.toJSON);
        newMedicalRecord.fechaDeAprobacion = new Date();
        promises.push(newMedicalRecord.save());
      }

      await Promise.all(promises);

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
      const onHoldId = req.params.id;
      const onHold = await (this.OnHold
        .findById(onHoldId) as any)
        .orFail(notFound("El documento en espera no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));
      onHold.estado = "Aprobado";
      const promises = [onHold.save()];

      if (onHold.tipo === "triaje") {
        const actualTriage = await (this.Triage.find({
          "paciente": onHold.paciente
        }) as any).orFail(notFound("El triaje no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

        (actualTriage as any).modificaciones.push({
          ...onHold,
          fechaDeAprobacion: new Date()
        });

        promises.push((actualTriage as any).save());

      } else {
        const actualMedicalRecord = await (this.MedicalRecord.find({
          "paciente": onHold.paciente
        }) as any).orFail(notFound("El triaje no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

        (actualMedicalRecord as any).modificaciones.push({
          ...onHold,
          fechaDeAprobacion: new Date()
        });

        promises.push((actualMedicalRecord as any).save());
      }

      await Promise.all(promises);

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
  public async changeStatusOnHold(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const status = req.query.status;
      if (!status) {
        return next(badRequest("Debe suministrar el nuevo estado del documento"));
      }
      const onHoldUpdated = await (this.OnHold
        .findByIdAndUpdate(onHoldId, {
          $set: { "estado": "Rechazado" }
        }, { new: true }) as any)
        .orFail(notFound("El document no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo"));

      res
        .status(203)
        .json({
          httpCode: 203,
          message: "El documento ha sido rechazado con exito",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldsByPersonal(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 9;
      const status = req.query.status || "En espera";
      const personalId = req.params.personalId;

      const onHolds = await (this.OnHold.find({
        "estado": status,
        "personal": personalId
      })
        .skip(offset)
        .limit(limit) as any)
        .orFail(notFound(`No hay documentos ${status}`));

      res
        .status(200)
        .json({
          data: {
            documents: onHolds
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
  public async getOnHold(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const onHold = await (this.OnHold
        .findById(onHoldId) as any)
        .orFail("El document no ha sido encontrado. Si esta seguro de que el documento existe," +
          " vuelva a intentarlo");

      res
        .status(200)
        .json({
          data: {
            document: onHold
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