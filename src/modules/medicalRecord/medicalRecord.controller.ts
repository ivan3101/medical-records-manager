import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { File } from "formidable";
import { promises } from "fs";
import { Model } from "mongoose";
import { join } from "path";
import { HelperService } from "../../services/helperService";
import { historyModel, IHistory } from "../history/history.model";
import { IMedicalRecord, medicalRecordModel } from "./medicalRecord.model";

export class MedicalRecordController {
  private readonly MedicalRecord: Model<IMedicalRecord> = medicalRecordModel;
  private readonly History: Model<IHistory> = historyModel;

  @bind
  public async createMedicalRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const files: File[] = [
        req.files.periodontodiagrama,
        req.files.registroDeControlDePlaca
      ];

      const patientId = req.params.id;
      const medicalRecordPrmoise = this.MedicalRecord.findOne({
        active: true,
        paciente: patientId
      });

      const documentJson = JSON.parse(req.fields.historiaClinica as string);

      const documentMap = new Map(Object.entries(documentJson));

      const newMedicalRecord = new this.MedicalRecord({
        documento: documentMap,
        paciente: patientId
      });

      if (await medicalRecordPrmoise) {
        await HelperService.deleteUploads(files);
        return next(
          badRequest("Este paciente ya cuenta con una historia medica")
        );
      }

      const filePaths = await HelperService.moveUploads(
        files,
        "medicalrecord",
        newMedicalRecord._id.toString()
      );

      newMedicalRecord.documento.set("periodontodiagrama", filePaths[0]);
      newMedicalRecord.documento.set("registroDeControlDePlaca", filePaths[1]);

      await newMedicalRecord.save();

      const newHistoryEntry = new this.History({
        accion: "Historia Medica creada",
        autor: {
          id: req.user._id,
          type: "personal"
        },
        cambios: newMedicalRecord.documento,
        paciente: patientId
      });

      await newHistoryEntry.save();

      res.status(201).json({
        httpCode: 201,
        message: "Historia medica agregado con exito",
        state: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllMedicalRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const allMedicalRecords = await (this.MedicalRecord.find({
        active: true
      }) as any).orFail(notFound("No se encontraron Historias medicas"));

      res.status(200).json({
        data: {
          document: allMedicalRecords
        },
        httpCode: 200,
        message: "Historias medicas encontrados satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getMedicalRecordById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const medicalRecordId = req.params.id;
      const medicalRecord = await (this.MedicalRecord.findOne({
        _id: medicalRecordId,
        active: true
      }) as any).orFail(
        notFound(
          "No se pudo encontrar la Historia medica. Si esta seguro de que existe, por favor vuelva a" +
            " intentarlo"
        )
      );

      res.status(200).json({
        data: {
          historiaMedica: medicalRecord
        },
        httpCode: 200,
        message: "Historia medica encontrada satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyMedicalRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const patientId = req.params.id;
      const medicalRecord = await (this.MedicalRecord.findOne({
        active: true,
        paciente: patientId
      }) as any).orFail(
        notFound(
          "Historia medica no encontrada. Si esta seguro de que existe, por favor vuelva a intentarlo"
        )
      );

      let documentJson = JSON.parse(req.fields.historiaClinica as string);

      const medicalRecordDocumentObj = Object.create(null);

      for (const [key, value] of medicalRecord.documento) {
        medicalRecordDocumentObj[key] = value;
      }

      const changesMap = new Map(Object.entries(documentJson));

      for (const [key, value] of changesMap.entries()) {
        if (medicalRecord.documento.has(key)) {
          if (key !== "periodontograma" && key !== "registroDeControlDePlaca") {
            medicalRecord.documento.set(key, value);
          }
        }
      }

      const path = join(
        process.cwd(),
        "public",
        "medicalrecord",
        medicalRecord._id.toString()
      );

      if (req.files.periodontodiagrama && req.files.registroDeControlDePlaca) {
        await HelperService.deleteFilesInDirectory(path);

        const files: File[] = [
          req.files.periodontodiagrama,
          req.files.registroDeControlDePlaca
        ];

        const filesPath = await HelperService.moveUploads(
          files,
          "medicalrecord",
          medicalRecord._id.toString()
        );

        medicalRecord.documento.set("periodontodiagrama", filesPath[0]);
        medicalRecord.documento.set("registroDeControlDePlaca", filesPath[1]);
      } else if (req.files.periodontodiagrama) {
        await promises.unlink(
          join(
            process.cwd(),
            "public",
            medicalRecord.documento.get("periodontodiagrama")
          )
        );

        const files: File[] = [req.files.periodontodiagrama];

        const filesPath = await HelperService.moveUploads(
          files,
          "medicalrecord",
          medicalRecord._id.toString()
        );

        medicalRecord.documento.set("periodontodiagrama", filesPath[0]);
      } else if (req.files.registroDeControlDePlaca) {
        await promises.unlink(
          join(
            process.cwd(),
            "public",
            medicalRecord.documento.get("registroDeControlDePlaca")
          )
        );

        const files: File[] = [req.files.registroDeControlDePlaca];

        const filesPath = await HelperService.moveUploads(
          files,
          "medicalrecord",
          medicalRecord._id.toString()
        );

        medicalRecord.documento.set("registroDeControlDePlaca", filesPath[0]);
      }

      await medicalRecord.save();

      if (req.files.periodontodiagrama) {
        documentJson = {
          ...documentJson,
          periodontodiagrama: medicalRecord.documento.get("periodontodiagrama")
        };
      }

      if (req.files.registroDeControlDePlaca) {
        documentJson = {
          ...documentJson,
          registroDeControlDePlaca: medicalRecord.documento.get(
            "registroDeControlDePlaca"
          )
        };

      }

      const documentChanges = HelperService.objectDiff(
        documentJson,
        medicalRecordDocumentObj
      );

      const newHistoryEntry = new this.History({
        accion: "Historia Medica modificada",
        autor: {
          id: req.user._id,
          type: req.user.rol === "estudiante" ? "estudiante" : "personal"
        },
        cambios: documentChanges,
        paciente: patientId
      });

      await newHistoryEntry.save();

      res.status(204).json({
        httpCode: 204,
        message: "Historia medica modificada satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deleteMedicalRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const medicalRecordId = req.params.id;

      await (this.MedicalRecord.findByIdAndUpdate(
        medicalRecordId,
        {
          $set: {
            active: false
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "La Historia medica no fue encontrada. Si esta seguro de que existe, por favor vuelva a" +
            " intentarlo"
        )
      );

      res.status(204).json({
        httpCode: 204,
        message: "La Historia medica fue eliminada satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }
}
