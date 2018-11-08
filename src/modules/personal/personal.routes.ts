import { Router } from "express";
import { AuthService } from "../../services/authService";
import { PersonalController } from "./personal.controller";

export class PersonalRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly personalController: PersonalController = new PersonalController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes() {
    this.router
      .get("/", this.authService.isAuthorized(), this.personalController.getAllPersonals)
      .post("/", this.authService.isAuthorized(), this.personalController.addPersonal)
      .get("/:id", this.authService.isAuthorized(), this.personalController.getPersonalById)
      .patch("/:id", this.authService.isAuthorized(), this.personalController.modifyPersonal)
      .delete("/:id", this.authService.isAuthorized(), this.personalController.deletePersonal);
  }
}