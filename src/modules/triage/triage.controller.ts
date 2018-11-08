import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { ITriage, triageModel } from "./triage.model";

export class TriageController {
  private readonly Triage: Model<ITriage> = triageModel;

  @bind
  public async createTriage(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const patientId = req.params.id;
      const triagePromise = this.Triage.findOne({
        "active": true,
        "paciente": patientId
      });

      const newTriage = new this.Triage({
        ...req.body.triaje,
        paciente: patientId
      });

      if (await triagePromise) {
        return next(badRequest("Este paciente ya cuenta con un Triaje creado"));
      }

      newTriage.numeroDeHistoria = await (this.Triage as any).setRecordNumber();

      await newTriage.save();

      res
        .status(201)
        .json({
          httpCode: 201,
          message: "Triaje agregado con exito",
          state: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllTriages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const allTriages = await (this.Triage
        .find({
          "active": true
        }) as any)
        .orFail(notFound("No se encontraron Triajes"));

      res
        .status(200)
        .json({
          data: {
            document: allTriages
          },
          httpCode: 200,
          message: "Triajes encontrados satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getTriageById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const triageId = req.params.id;
      const triage = await (this.Triage
        .findOne({
          "_id": triageId,
          "active": true
        }) as any)
        .orFail(notFound("No se pudo encontrar el Triaje. Si esta seguro de que existe, por favor vuelva a" +
          " intentarlo"));

      res
        .status(200)
        .json({
          data: {
            triaje: triage
          },
          httpCode: 200,
          message: "Triaje encontrado satisfactoriamente",
          status: "successful"
        })

    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyTriage(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const triageId = req.params.id;
      const triageModified = await (this.Triage
        .findByIdAndUpdate(triageId, {
          $set: {
            ...req.body.triaje
          }
        }, { new: true }) as any)
        .orFail(notFound("Triaje no encontrado. Si esta seguro de que existe, por favor vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Triage modificado satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async updateTriage(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const triageId = req.params.id;
      const triage = await (this.Triage
        .findById(triageId) as any)
        .orFail(notFound("Triaje no encontrado. Si esta seguro de que existe, por favor vuelva a intentarlo"));

      triage.modificaciones.push(req.body.triaje.modificaciones);

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Triaje actualizado satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deleteTriage(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const triageId = req.params.id;

      const deletedTriage = await (this.Triage
        .findByIdAndUpdate(triageId, {
          $set: {
            "active": false
          }
        }, { new: true }) as any)
        .orFail(notFound("El Triaje no fue encontrado. Si esta seguro de que existe, por favor vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "El Triaje fue eliminado satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e);
    }
  }
}