import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { IMedicalRecord, medicalRecordModel } from "../medicalRecord/medicalRecord.model";
import { ITriage, triageModel } from "../triage/triage.model";
import { IPatient, patientModel } from "./patient.model";

export class PatientController {

  private readonly Patient: Model<IPatient> = patientModel;
  private readonly Triage: Model<ITriage> = triageModel;
  private readonly MedicalRecord: Model<IMedicalRecord> = medicalRecordModel;

  @bind
  public async addPatient(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const cedula = this.Patient.findOne({
        "active": true,
        "cedula": req.body.paciente.cedula,
      });

      if (await cedula) {
        next(badRequest("Ya se encuentra registrado un paciente con esa cedula"));
      } else {
        const newPatient = new this.Patient(req.body.paciente);
        await newPatient.save();

        res
          .status(201)
          .json({
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
  public async deletePatient(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const patientId = req.params.id;
      const deletedPatient = await (this.Patient
        .findByIdAndUpdate(patientId, {
          $set: {
            "active": false
          }
        }, { new: true }) as any)
        .orFail(notFound("No se encontro al paciente. Si esta seguro de que el paciente existe en el sistema, por" +
          " favor vuelva a intentarlo"));

      res
        .status(204)
        .json({
          httpCode: 204,
          message: "Paciente eliminado correctamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getPatientById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const patientId = req.params.id;
      const patient = await (this.Patient
        .findOne({
          "_id": patientId,
          "active": true
        }) as any)
        .orFail(notFound("No se encontro al paciente. Si esta seguro de que el paciente existe en el sistema, por" +
          " favor vuelva a intentarlo"));

      res
        .status(200)
        .json({
          data: {
            paciente: patient
          },
          httpCode: 200,
          message: "Paciente encontrado satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllPatients(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 9;
      const patients = await (this.Patient
        .find({
          "active": true
        })
        .skip(offset)
        .limit(limit) as any)
        .orFail(notFound("No se encontro ningun paciente"));

      res
        .status(200)
        .json({
          data: {
            pacientes: patients
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
  public async getTriagePatient(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const patientId = req.query.id;
      const triage = await (this.Triage
        .find({
          "active": true,
          "paciente": patientId
        }) as any)
        .orFail(notFound("No se encontro el Triaje del Paciente. Si esta seguro de que el triaje existe en el" +
          " sistema, por favor vuelva a intentarlo"));

      res
        .status(200)
        .json({
          data: {
            triaje: triage
          },
          httpCode: 200,
          message: "Triaje encontrado satisfactoriamente",
          status: "successful"
        });
    } catch (e) {
      next(e)
    };
  }

  @bind
  public async getMedicalRecordPatient(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const patientId = req.params.id;
      const medicalRecord = await (this.MedicalRecord
        .find({
          "active": true,
          "paciente": patientId
        }) as any)
        .orFail(notFound("No se encontro la Historia medica del paciente. Si esta seguro de que esta Historia" +
          " existe, por favor vuelva a intentarlo"));

      res
        .status(200)
        .json({
          data: {
            historiaMedica: medicalRecord
          },
          httpCode: 200,
          message: "Historia medica encontrada satisfactoriamente",
          status: "successful"
        })
    } catch (e) {
      next(e);
    }
  }
}