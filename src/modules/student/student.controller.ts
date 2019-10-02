import { badRequest, notFound } from "boom";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { IStudent, studentModel } from "./student.model";

export class StudentController {
  private readonly Student: Model<IStudent> = studentModel;

  @bind
  public async addStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const cedula = this.Student.findOne({
        cedula: req.body.estudiante.cedula
      }) as any;

      const email = this.Student.findOne({
        email: req.body.estudiante.email
      }) as any;

      const promises = await Promise.all([cedula, email]);

      if (promises[0]) {
        next(
          badRequest("Ya se encuentra registrado un estudiante con esa cedula")
        );
      } else if (promises[1]) {
        next(
          badRequest(
            "Ya se encuentra registrado un estudiante con ese correo. Por favor, escoja otro y vuelva a" +
              " intentarlo"
          )
        );
      } else {
        const newStudent = new this.Student(req.body.estudiante);
        await newStudent.save();

        res.status(201).json({
          httpStatus: 201,
          message: "El estudiante ha sido agregado exitosamente al sistema",
          status: "successful"
        });
      }
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async deleteStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const studentId = req.params.id;
      const deletedStudent = await (this.Student.findByIdAndUpdate(studentId, {
        $set: {
          active: false
        }
      }) as any).orFail(
        notFound(
          "Estudiante no encontrado. Si esta seguro de que el estudiante existe, por favor vuelva a" +
            " intentarlo"
        )
      );

      res.status(200).json({
        httpCode: 200,
        message: "El Estudiante ha sido eliminado satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getAllStudents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const startIndex = req.query.startIndex || null;
      const limit = 46;

      let students;

      if (startIndex) {
        students = await this.Student.find({
          active: true,
          nombre: { $gte: startIndex }
        })
          .sort("nombre")
          .limit(limit);
      } else {
        students = await this.Student.find({
        	active: true
        })
          .sort("nombre")
          .limit(limit);
      }

      const nextStartIndex =
        students.length < limit ? null : students[students.length - 1].nombre;

      return res.status(200).json({
        data: {
          startIndex: nextStartIndex,
          students: students.slice(0, limit - 1)
        },
        httpCode: 200,
        message: "Estudiantes encontrados satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getStudentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const studentId = req.params.id;

      const student = await (this.Student.findOne({
        _id: studentId,
        active: true
      }) as any).orFail(
        notFound(
          "No se encontro al Estudiante. Si esta seguro de que el estudiante existe, por favor vuelva" +
            " a intentarlo"
        )
      );

      res.status(200).json({
        data: {
          estudiante: student
        },
        httpCode: 200,
        message: "El Estudiante ha sido encontrado satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async modifyStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const studentId = req.params.id;
      const modifiedStudent = await (this.Student.findOneAndUpdate(
        {
          _id: studentId,
          active: true
        },
        {
          $set: {
            ...req.body.estudiante
          }
        }
      ) as any).orFail(
        notFound(
          "No se encontro el Estudiante. Si esta seguro de que el estudiante existe, por favor vuelva" +
            " a intentarlo"
        )
      );

      res.status(204).json({
        httpCode: 204,
        message: "El Estudiante ha sido modificado satisfactoriamente",
        status: "successful"
      });
    } catch (e) {
      next(e);
    }
  }

  @bind
  public async getFilteredStudents(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const matchText: string = req.query.matchText;

      (this.Student as any)
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
        }, (err, filteredStudents) => {
          if (err) {
            return next(err);
          }

          res
            .status(200)
            .json({
              data: {
                students: filteredStudents.hits.hits
              }
            })
        });
    } catch (e) {
      next(e)
    }
  }
}
