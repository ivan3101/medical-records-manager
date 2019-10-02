import { notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { historyModel, IHistory } from "./history.model";

export class HistoryController {
  private readonly History: Model<IHistory> = historyModel;

  @bind
  public async getPatientHistory(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const patientId = req.params.patientId;

      const history = await (this.History.find({
        "paciente": patientId
      })
        .sort("-fechaDeCreacion")
        .orFail(notFound("Este paciente aun no tiene Triaje ni Historia medica creada")));
        // .populate("autor", ["nombre", "apellido", "cedula"]);

      res
        .status(200)
        .json({
          data: {
            historial: history
          },
          httpCode: 200,
          message: "Historial encontrado satisfactoriamente"
        });
      
    } catch (e) {
      next(e);
    }
  }
}