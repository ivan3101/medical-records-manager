import { badRequest } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { IPatient, PatientModel } from "./patient.model";

export class PatientController {

  private readonly Patient: Model<IPatient> = new PatientModel().Model;

  @bind
  public async addPatient(req: Request, res: Response, next: NextFunction) {
    const cedula = this.Patient.findOne({
      "cedula": req.body.paciente.cedula
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
  }
}