import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { IMedicalRecord, medicalRecordModel } from "./medicalRecord.model";

export class MedicalRecordController {
  private readonly MedicalRecord: Model<IMedicalRecord> = medicalRecordModel;

  @bind
  public async createMedicalRecord(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const patientId = req.params.id;
      const medicalRecordPrmoise = this.MedicalRecord.findOne({
        "active": true,
        "paciente": patientId
      });

      const newMedicalRecord = new this.MedicalRecord({
        ...req.body.triaje,
        paciente: patientId
      });

      if (await medicalRecordPrmoise) {
        return next(badRequest("Este paciente ya cuenta con una historia medica"))
      }
      
      await newMedicalRecord.save();

      res
        .status(201)
        .json({
          httpCode: 201,
          message: "Historia medica agregado con exito",
          state: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllMedicalRecords(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const allMedicalRecords = await (this.MedicalRecord
        .find({
          "active": true
        }) as any)
        .orFail(notFound("No se encontraron Historias medicas"));

      res
        .status(200)
        .json({
          data: {
            document: allMedicalRecords
          },
          httpCode: 200,
          message: "Historias medicas encontrados satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyMedicalRecord(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const medicalRecordId = req.params.id;
      const medicalRecordModified = await (this.MedicalRecord
        .findOneAndUpdate({
          "_id": medicalRecordId,
          "active": true
        }, {
          $set: {
            ...req.body.triaje
          }
        }, { new: true }) as any)
        .orFail(notFound("Historia medica no encontrada. Si esta seguro de que existe, por favor vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Historia medica modificada satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async updateMedicalRecord(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const medicalRecordId = req.params.id;
      const medicalRecord = await (this.MedicalRecord
        .findOne({
          "_id": medicalRecordId,
          "active": true
        }) as any)
        .orFail(notFound("Historia medica no encontrada. Si esta seguro de que existe, por favor vuelva a intentarlo"));

      medicalRecord.modificaciones.push(req.body.triaje.modificaciones);

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Historia medica actualizada satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deleteMedicalRecord(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const medicalRecordId = req.params.id;

      const deletedMedicalRecord = await (this.MedicalRecord
        .findByIdAndUpdate(medicalRecordId, {
          $set: {
            "active": false
          }
        }, { new: true }) as any)
        .orFail(notFound("La Historia medica no fue encontrada. Si esta seguro de que existe, por favor vuelva a" +
          " intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "La Historia medica fue eliminada satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }
}