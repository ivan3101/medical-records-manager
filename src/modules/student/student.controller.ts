import { badRequest } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { IStudent, StudentModel } from "./student.model";

export class StudentController {

  private readonly Student: Model<IStudent> = new StudentModel().Model;

  @bind
  public async addStudent(req: Request, res: Response, next: NextFunction): Promise<any> {
    const cedula = this.Student.findOne({
      "cedula": req.body.estudiante.cedula
    }) as any;

    const email = this.Student.findOne({
      "email": req.body.estudiante.email
    }) as any;

    const promises = await Promise.all([cedula, email]);

    if (promises[0]) {
      next(badRequest("Ya se encuentra registrado un estudiante con esa cedula"));
    } else if (promises[1]) {
      next(badRequest("Ya se encuentra registrado un estudiante con ese correo. Por favor, escoja otro y vuelva a" +
        " intentarlo"));
    } else {
      const newStudent = new this.Student(req.body.estudiante);
      await newStudent.save();

      res
        .status(201)
        .json({
          httpStatus: 201,
          message: "El estudiante ha sido agregado exitosamente al sistema",
          status: "successful"
        })
    }
  }

}