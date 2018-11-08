import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthService } from "../../services/authService";
import { PersonalController } from "./personal.controller";

export class PersonalRoutes {
  private readonly router = decorateApp(Router());
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
      .getAsync("/", this.authService.isAuthorized(), this.personalController.getAllPersonals)
      .postAsync("/", this.authService.isAuthorized(), this.personalController.addPersonal)
      .getAsync("/:id", this.authService.isAuthorized(), this.personalController.getPersonalById)
      .patchAsync("/:id", this.authService.isAuthorized(), this.personalController.modifyPersonal)
      .deleteAsync("/:id", this.authService.isAuthorized(), this.personalController.deletePersonal);
  }
}