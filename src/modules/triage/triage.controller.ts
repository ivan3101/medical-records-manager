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

      const lastTriage = await this.Triage
        .find({})
        .where("numeroDeHistoria.codigo").equals("CIN-18")
        .sort({ "numeroDeHistoria.numero": -1 })
        .limit(1)
        .select("numeroDeHistoria");

      if (lastTriage.length){
        const lastNumber = lastTriage[0].numeroDeHistoria.numero;

        newTriage.numeroDeHistoria = {
          "codigo": "CIN-18",
          "numero": lastNumber + 1
        };

      } else {
        newTriage.numeroDeHistoria = {
          "codigo": "CIN-18",
          "numero": 1
        };
      }

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