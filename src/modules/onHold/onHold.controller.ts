import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { HelperService } from "../../services/helperService";
import { historyModel, IHistory } from "../history/history.model";
import {
  IMedicalRecord,
  medicalRecordModel
} from "../medicalRecord/medicalRecord.model";
import { IPatient, patientModel } from "../patient/patient.model";
import { ITriage, triageModel } from "../triage/triage.model";
import { IOnHold, onHoldModel } from "./onHold.model";

export class OnHoldController {
  private readonly OnHold: Model<IOnHold> = onHoldModel;
  private readonly Triage: Model<ITriage> = triageModel;
  private readonly Patient: Model<IPatient> = patientModel;
  private readonly MedicalRecord: Model<IMedicalRecord> = medicalRecordModel;
  private readonly History: Model<IHistory> = historyModel;

  @bind
  public async createOnHold(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      let promise = null;
      const studentId = req.params.studentId;

      const patient = this.Patient.findOne({
        _id: req.fields.paciente,
        active: true
      });

      let newOnHold;

      if (req.fields.tipo === "triaje") {
        promise = this.Triage.findOne({
          active: true,
          paciente: req.fields.paciente
        });

        const documentJson = JSON.parse(req.fields.documento as string);

        const document = new Map(Object.entries(documentJson));

        newOnHold = new this.OnHold({
          ...req.fields,
          documento: document,
          estudiante: studentId,
          modificacion: Boolean(req.fields.modificacion),
          tipo: "triaje"
        });
      } else if (req.fields.tipo === "historia principal") {
        promise = this.MedicalRecord.findOne({
          active: true,
          paciente: req.fields.paciente
        });

        const documentJson = JSON.parse(req.fields.documento as string);

        const document = new Map(Object.entries(documentJson));

        newOnHold = new this.OnHold({
          ...req.fields,
          documento: document,
          estudiante: studentId,
          modificacion: Boolean(req.fields.modificacion),
          tipo: "historia principal"
        });
      }

      if (!(await patient)) {
        return next(
          badRequest(
            "No se encontro el paciente seleccionado. Por favor, seleccione otro y vuelva a" +
              " intentarlo"
          )
        );
      }

      if ((await promise) && !Boolean(req.fields.modificacion)) {
        return next(
          badRequest(
            "Este paciente ya cuenta con este tipo de documento. Si esta tratando de agregar una" +
              " modificacíón, seleccione Modificacion en el menu"
          )
        );
      }

      if (!req.fields.modificacion) {
        if (req.fields.tipo === "triaje") {
          const files = [req.files.odontodiagrama];

          const odontodiagrama = (await HelperService.moveUploads(
            files,
            "onhold",
            newOnHold._id.toString()
          ))[0];

          newOnHold.documento.set("odontodiagrama", odontodiagrama);
        } else {
          const files = [
            req.files.periodontodiagrama,
            req.files.registroDeControlDePlaca
          ];

          const filePaths = await HelperService.moveUploads(
            files,
            "onhold",
            newOnHold._id.toString()
          );

          newOnHold.documento.set("periodontodiagrama", filePaths[0]);
          newOnHold.documento.set("registroDeControlDePlaca", filePaths[1]);
        }
      } else {

        let documentOriginal;

        if (req.fields.tipo === "historia principal") {
          documentOriginal = await this.MedicalRecord.findOne({
            active: true,
            paciente: req.fields.paciente
          });

          const onholdDocObj = {};

          for (const [key, value] of documentOriginal.documento.entries()) {
            onholdDocObj[key] = value;
          }

          const changes = HelperService.objectDiff(JSON.parse(req.fields.documento as string), onholdDocObj);

          const changesMap = new Map(Object.entries(changes));

          newOnHold.documento = changesMap;
        }


        if (req.fields.tipo === "triaje" && req.files.odontodiagrama) {
          const files = [req.files.odontodiagrama];

          const odontodiagrama = (await HelperService.moveUploads(
            files,
            "onhold",
            newOnHold._id.toString()
          ))[0];

          newOnHold.documento.set("odontodiagrama", odontodiagrama);
        } else {
          if (
            req.files.periodontodiagrama &&
            req.files.registroDeControlDePlaca
          ) {
            const files = [
              req.files.periodontodiagrama,
              req.files.registroDeControlDePlaca
            ];

            const filePaths = await HelperService.moveUploads(
              files,
              "onhold",
              newOnHold._id.toString()
            );

            newOnHold.documento.set("periodontodiagrama", filePaths[0]);
            newOnHold.documento.set("registroDeControlDePlaca", filePaths[1]);
          } else if (req.files.periodontodiagrama) {
            const files = [req.files.periodontodiagrama];

            const filePaths = await HelperService.moveUploads(
              files,
              "onhold",
              newOnHold._id.toString()
            );

            newOnHold.documento.set("periodontodiagrama", filePaths[0]);
          } else if (req.files.registroDeControlDePlaca) {
            const files = [req.files.registroDeControlDePlaca];

            const filePaths = await HelperService.moveUploads(
              files,
              "onhold",
              newOnHold._id.toString()
            );

            newOnHold.documento.set("registroDeControlDePlaca", filePaths[0]);
          }
        }
      }

      await newOnHold.save();

      res.status(201).json({
        httpCode: 201,
        message:
          "Documento agregado a la lista de espera correctamente. En espera de revision por parte de el" +
          " Profesor",
        state: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllOnHolds(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 9;
      const status = req.query.status || "En espera";

      const onHolds = await (this.OnHold.find({
        active: true,
        estado: status
      })
        .skip(offset)
        .limit(limit) as any).orFail(notFound(`No hay documentos ${status}`));

      res.status(200).json({
        data: {
          enEspera: onHolds
        },
        httpCode: 200,
        message: "Documentos encontrados satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async approveOnHoldNew(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.onHoldId;
      const professorId = req.params.professorId;

      const onHold = await (this.OnHold.findOneAndUpdate(
        {
          _id: onHoldId,
          active: true,
          estado: "En espera",
          profesor: professorId
        },
        {
          $set: {
            estado: "Aprobado"
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "El documento en espera no ha sido encontrado. Si esta seguro de que el documento" +
            " existe," +
            " vuelva a intentarlo"
        )
      );

      if (onHold.tipo === "triaje") {
        if (!onHold.modificacion) {
          const newTriage = new this.Triage({
            documento: onHold.documento,
            paciente: onHold.paciente
          });
          newTriage.numeroDeHistoria = await (this
            .Triage as any).setRecordNumber();
          await newTriage.save();
        } else {
          const triage = await this.Triage.findOne({
            active: true,
            paciente: onHold.paciente
          });

          for (const [key, value] of onHold.documento.entries()) {
            if (triage.documento.has(key)) {
              triage.documento.set(key, value);
            }
          }

          await triage.save();
        }
      } else {
        if (!onHold.modificacion) {
          const newMedicalRecord = new this.MedicalRecord({
            documento: onHold.documento,
            paciente: onHold.paciente
          });
          await newMedicalRecord.save();
        } else {
          const medicalRecord = await this.MedicalRecord.findOne({
            active: true,
            paciente: onHold.paciente
          });

          for (const [key, value] of onHold.documento.entries()) {
            if (medicalRecord.documento.has(key)) {
              medicalRecord.documento.set(key, value)
            }
          }

          await medicalRecord.save();
        }
      }

      res.status(201).json({
        httpCode: 201,
        message: "Documente aprobado con exito",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async approveOnHoldUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.onHoldId;
      const professorId = req.params.professorId;

      const onHold = await (this.OnHold.findOneAndUpdate(
        {
          _id: onHoldId,
          active: true,
          estado: "En espera",
          modificacion: true,
          profesor: professorId
        },
        {
          $set: {
            estado: "Aprobado"
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "El documento en espera no ha sido encontrado. Si esta seguro de que el documento existe," +
            " vuelva a intentarlo"
        )
      );

      let document;

      if (onHold.tipo === "triaje") {
        document = await (this.Triage.findOne({
          paciente: onHold.paciente
        }) as any).orFail(
          notFound(
            "El triaje no ha sido encontrado. Si esta seguro de que el" +
              " documento existe," +
              " vuelva a intentarlo"
          )
        );
      } else {
        document = await (this.MedicalRecord.findOne({
          paciente: onHold.paciente
        }) as any).orFail(
          notFound(
            "El triaje no ha sido encontrado. Si esta seguro de que el documento existe," +
              " vuelva a intentarlo"
          )
        );
      }

      for (const [key, value] of onHold.documento.entries()) {
        document.documento.set(key, value);
      }

      await document.save();

      const newHistoryEntry = new this.History({
        accion: "Actualizado",
        autor: {
          id: onHold.estudiante,
          type: "estudiante"
        },
        cambios: onHold.documento,
        paciente: onHold.paciente
      });

      await newHistoryEntry.save();

      res.status(204).json({
        httpCode: 204,
        message: "Documento aprobado exitosamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async rejectOnHold(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.onHoldId;
      const professorId = req.params.professorId;

      const onHoldUpdated = await (this.OnHold.findOneAndUpdate(
        {
          _id: onHoldId,
          active: true,
          estado: "En espera",
          profesor: professorId
        },
        {
          $set: { estado: "Rechazado" }
        },
        { new: true }
      ) as any)

      res.status(204).json({
        httpCode: 204,
        message: "El documento ha sido rechazado con exito",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldsByProfessor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const professorId = req.params.professorId;

      const onHolds = await (this.OnHold.find({
        active: true,
        estado: "En espera",
        profesor: professorId
      })
        .populate("paciente")
        .populate("estudiante") as any).orFail(
        notFound(`No hay documentos en espera`)
      );

      res.status(200).json({
        data: {
          enEspera: onHolds
        },
        httpCode: 200,
        message: "Documentos encontrados satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const onHold = await (this.OnHold.findOne({
        _id: onHoldId,
        active: true
      }) as any).orFail(
        notFound(
          "El document no ha sido encontrado. Si esta seguro de que el documento existe," +
            " vuelva a intentarlo"
        )
      );

      res.status(200).json({
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
  public async modifyOnHold(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.onholdId;
      const studentId = req.params.studenId;
      const onHoldModified = await (this.OnHold.findOneAndUpdate(
        {
          _id: onHoldId,
          active: true,
          estado: "Rechazado",
          estudiante: studentId
        },
        {
          $set: {
            document: req.fields.documento,
            estado: "En espera"
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "El documento no ha sido encontrado. Si esta seguro de que el documento existe, vuelva a" +
            " intentarlo"
        )
      );

      res.status(204).json({
        httpCode: 204,
        message: "Documento actualizado correctamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deleteOnHold(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const onHoldModified = await (this.OnHold.findOneAndUpdate(
        {
          _id: onHoldId,
          active: true
        },
        {
          $set: {
            active: false
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "El documento no ha sido encontrado. Si esta seguro de que el documento existe, vuelva a" +
            " intentarlo"
        )
      );

      res.status(204).json({
        httpCode: 204,
        message: "Documento actualizado correctamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldsByStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const studentId = req.params.studentId;
      const patientId = req.params.patientId;

      const onHolds = await this.OnHold.find({
        active: true,
        estudiante: studentId,
        paciente: patientId,
      }).populate("paciente").populate("estudiante").sort("-fechaDeCreacion");

      res.status(200).json({
        data: {
          enEspera: onHolds
        },
        httpCode: 200,
        message: "Documentos encontrados satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getOnHoldByStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.id;
      const studentId = req.params.studentId;
      const status = req.query.status || "En espera";

      const onHold = await (this.OnHold.findOne({
        _id: onHoldId,
        active: true,
        estado: status,
        estudiante: studentId
      }) as any).orFail(
        notFound(
          "El document no ha sido encontrado. Si esta seguro de que el documento existe," +
            " vuelva a intentarlo"
        )
      );

      res.status(200).json({
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
  public async getOnHoldByProfessor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const onHoldId = req.params.onholdId;
      const professorId = req.params.professorId;

      const onHold = await (this.OnHold.findOne({
        _id: onHoldId,
        active: true,
        estado: "En espera",
        profesor: professorId
      }) as any).orFail(
        notFound(
          "El document no ha sido encontrado. Si esta seguro de que el documento existe," +
            " vuelva a intentarlo"
        )
      );

      res.status(200).json({
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
