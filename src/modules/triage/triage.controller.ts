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

      const newTriage = new this.Triage({
        ...req.body.triaje,
        paciente: patientId
      });

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
}