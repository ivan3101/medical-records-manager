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
      .get("/",
        this.authService.isAuthorized(),
        this.authService.hasPermission("student", "read"),
        this.studentController.getAllStudents)

      .post("/",
        this.authService.isAuthorized(),
        this.authService.hasPermission("student", "create"),
        this.studentController.addStudent)

      .get("/filter",
        this.authService.isAuthorized(),
        this.authService.hasPermission("student", "create"),
        this.studentController.getFilteredStudents)

      .get("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("student", "read"),
        this.studentController.getStudentById)

      .patch("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("student", "modify"),
        this.studentController.modifyStudent)

      .delete("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("student", "delete"),
        this.studentController.deleteStudent);
  }
}