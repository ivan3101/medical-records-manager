import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import {
  IMedicalRecord,
  medicalRecordModel
} from "../medicalRecord/medicalRecord.model";
import { ITriage, triageModel } from "../triage/triage.model";
import { IPatient, patientModel } from "./patient.model";

export class PatientController {
  private readonly Patient: Model<IPatient> = patientModel;
  private readonly Triage: Model<ITriage> = triageModel;
  private readonly MedicalRecord: Model<IMedicalRecord> = medicalRecordModel;

  @bind
  public async addPatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const cedula = this.Patient.findOne({
        active: true,
        cedula: req.body.paciente.cedula
      });

      if (await cedula) {
        next(
          badRequest("Ya se encuentra registrado un paciente con esa cedula")
        );
      } else {
        const newPatient = new this.Patient(req.body.paciente);
        await newPatient.save();

        res.status(201).json({
          httpStatus: 201,
          message: "El paciente ha sido agregado exitosamente al sistema",
          status: "successful"
        });
      }
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deletePatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const patientId = req.params.id;
      const deletedPatient = await (this.Patient.findByIdAndUpdate(
        patientId,
        {
          $set: {
            active: false
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "No se encontro al paciente. Si esta seguro de que el paciente existe en el sistema, por" +
            " favor vuelva a intentarlo"
        )
      );

      res.status(204).json({
        httpCode: 204,
        message: "Paciente eliminado correctamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyPatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const patientId = req.params.id;
      const modifiedPatient = await (this.Patient.findOneAndUpdate(
        {
          _id: patientId,
          active: true
        },
        {
          $set: {
            ...req.body.paciente
          }
        },
        { new: true }
      ) as any).orFail(
        notFound(
          "No se encontro al paciente. Si esta seguro de que el paciente existe en el sistema, por" +
            " favor vuelva a intentarlo"
        )
      );

      res.status(204).json({
        httpCode: 204,
        message: "Paciente modificado satisfactoriamente",
        status: "success"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getPatientById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const patientId = req.params.id;

      const patient = await (this.Patient.findOne({
        _id: patientId,
        active: true
      }) as any).orFail(
        notFound(
          "No se encontro al paciente. Si esta seguro de que el paciente existe en el sistema, por" +
            " favor vuelva a intentarlo"
        )
      );

      res.status(200).json({
        data: {
          paciente: patient
        },
        httpCode: 200,
        message: "Paciente encontrado satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllPatients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const startIndex = req.query.startIndex || null;
      const limit = 46;

      let patients;

      if (startIndex) {
        patients = await this.Patient.find({
          active: true,
          nombre: { $gte: startIndex }
        })
          .sort("nombre")
          .limit(limit);
      } else {
        patients = await this.Patient.find({
          active: true
        })
          .sort("nombre")
          .limit(limit);
      }

      const nextStartIndex = patients.length < limit ? null : patients[patients.length - 1].nombre;

      return res.status(200).json({
        data: {
          patients: patients.slice(0, limit - 1),
          startIndex: nextStartIndex
        },
        httpCode: 200,
        message: "Pacientes encontrados satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getTriagePatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const patientId = req.params.id;

      const triage = await (this.Triage.findOne({
        active: true,
        paciente: patientId
      }).populate("paciente") as any).orFail(
        notFound(
          "No se encontro el Triaje del Paciente. Si esta seguro de que el triaje existe en el" +
            " sistema, por favor vuelva a intentarlo"
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
  public async getMedicalRecordPatient(
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
          "No se encontro la Historia medica del paciente. Si esta seguro de que esta Historia" +
            " existe, por favor vuelva a intentarlo"
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
  public async getFilteredPatients(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const matchText: string = req.query.matchText;

      (this.Patient as any)
        .search({
          match: {
            nombre: {
              fuzziness: "AUTO",
              max_expansions: 200,
              prefix_length: 0,
              query: matchText
            }
          }
        },{
          hydrate: false
        }, (err, filteredPatients) => {
          if (err) {
            return next(err);
          }

          return res
            .status(200)
            .json({
              data: {
                patients: filteredPatients.hits.hits
              }
            })
        });
    } catch (e) {
      next(e);
    }
  }

}
