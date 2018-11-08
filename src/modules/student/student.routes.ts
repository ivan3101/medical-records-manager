import { Router } from "express";
import { AuthService } from "../../services/authService";
import { StudentController } from "./student.controller";

export class StudentRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly studentController: StudentController = new StudentController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .get("/", this.authService.isAuthorized(), this.studentController.getAllStudents)
      .post("/", this.authService.isAuthorized(), this.studentController.addStudent)
      .get("/:id", this.authService.isAuthorized(), this.studentController.getStudentById)
      .patch("/:id", this.authService.isAuthorized(), this.studentController.modifyStudent)
      .delete("/:id", this.authService.isAuthorized(), this.studentController.deleteStudent);
  }
}