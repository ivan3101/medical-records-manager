import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthService } from "../../services/authService";
import { StudentController } from "./student.controller";

export class StudentRoutes {
  private readonly router = decorateApp(Router());
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
      .getAsync("/", this.authService.isAuthorized(), this.studentController.getAllStudents)
      .postAsync("/", this.authService.isAuthorized(), this.studentController.addStudent)
      .getAsync("/:id", this.authService.isAuthorized(), this.studentController.getStudentById)
      .patchAsync("/:id", this.authService.isAuthorized(), this.studentController.modifyStudent)
      .deleteAsync("/:id", this.authService.isAuthorized(), this.studentController.deleteStudent);
  }
}