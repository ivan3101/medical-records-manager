import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { File } from "formidable";
import { Model } from "mongoose";
import { join } from "path";
import { HelperService } from "../../services/helperService";
import { historyModel, IHistory } from "../history/history.model";
import { ITriage, triageModel } from "./triage.model";

export class TriageController {
  private readonly Triage: Model<ITriage> = triageModel;
  private readonly History: Model<IHistory> = historyModel;

  @bind
  public async createTriage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const files: File[] = [req.files.odontodiagrama];

      const patientId = req.params.id;
      const triagePromise = this.Triage.findOne({
        active: true,
        paciente: patientId
      });

      const document = new Map(Object.entries(req.fields));

      const newTriage = new this.Triage({
        documento: document,
        paciente: patientId
      });

      if (await triagePromise) {
        await HelperService.deleteUploads(files);
        return next(badRequest("Este paciente ya cuenta con un Triaje creado"));
      }

      const odontodiagrama = (await HelperService.moveUploads(
        files,
        "triage",
        newTriage._id.toString()
      ))[0];

      newTriage.documento.set(
        "requerimientosClinicosDelPaciente",
        (req.fields.requerimientosClinicosDelPaciente as string).split(",")
      );
      newTriage.numeroDeHistoria = await (this.Triage as any).setRecordNumber();
      newTriage.documento.set("odontodiagrama", odontodiagrama);

      await newTriage.save();

      const newHistoryEntry = new this.History({
        accion: "Triaje creado",
        autor: {
          id: req.user._id,
          type: "personal"
        },
        cambios: newTriage.documento,
        paciente: patientId
      });

      await newHistoryEntry.save();

      res.status(201).json({
        httpCode: 201,
        message: "Triaje agregado con exito",
        state: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllTriages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const allTriages = await (this.Triage.find({
        active: true
      }) as any).orFail(notFound("No se encontraron Triajes"));

      res.status(200).json({
        data: {
          document: allTriages
        },
        httpCode: 200,
        message: "Triajes encontrados satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getTriageById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const triageId = req.params.id;
      const triage = await (this.Triage.findOne({
        _id: triageId,
        active: true
      }) as any).orFail(
        notFound(
          "No se pudo encontrar el Triaje. Si esta seguro de que existe, por favor vuelva a" +
            " intentarlo"
        )
      );

      res.status(200).json({
        data: {
          triaje: triage
        },
        httpCode: 200,
        message: "Triaje encontrado satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyTriage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const patientId = req.params.id;
      const triage = await (this.Triage.findOne({
        active: true,
        paciente: patientId
      }) as any).orFail(
        notFound(
          "Triaje no encontrado. Si esta seguro de que existe, por favor vuelva a intentarlo"
        )
      );

      const changesMap = new Map(Object.entries(req.fields));

      for (const [key, value] of changesMap.entries()) {
        if (triage.documento.has(key)) {
          if (key === "requerimientosClinicosDelPaciente") {
            triage.documento.set(key, (value as string).split(","));
          } else {
            triage.documento.set(key, value);
          }
        }
      }

      if (req.files.odontodiagrama) {
        const path = join(
          process.cwd(),
          "public",
          "triage",
          triage._id.toString()
        );
        await HelperService.deleteFilesInDirectory(path);

        const files: File[] = [req.files.odontodiagrama];

        const odontodiagrama = (await HelperService.moveUploads(
          files,
          "triage",
          triage._id.toString()
        ))[0];

        triage.documento.set("odontodiagrama", odontodiagrama);
      }

      await triage.save();

      const documentChanges = changesMap;

      if (documentChanges.has("requerimientosClinicosDelPaciente")) {
        documentChanges.set("requerimientosClinicosDelPaciente", triage.documento.get("requerimientosClinicosDelPaciente"))
      }

      if (req.fields.odontodiagrama) {
        documentChanges.set("odontodiagrama", triage.documento.get("odontodiagrama"));
      }

      const newHistoryEntry = new this.History({
        "accion": "Modificado",
        "autor": {
          "id": req.user._id,
          "type": req.user.rol === "estudiante" ? "estudiante" : "personal"
        },
        "cambios": documentChanges,
        "paciente": patientId
      });

      await newHistoryEntry.save();

      res.status(204).json({
        httpCode: 204,
        message: "Triage modificado satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deleteTriage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const triageId = req.params.id;

      await (this.Triage.findByIdAndUpdate(
        triageId,
        {
          $set: {
            active: false
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "El Triaje no fue encontrado. Si esta seguro de que existe, por favor vuelva a intentarlo"
        )
      );

      res.status(204).json({
        httpCode: 204,
        message: "El Triaje fue eliminado satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }
}
