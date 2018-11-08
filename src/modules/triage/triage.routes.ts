import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthService } from "../../services/authService";
import { TriageController } from "./triage.controller";

export class TriageRoutes {
  private readonly router = decorateApp(Router());
  private readonly authService: AuthService = new AuthService();
  private readonly triageController: TriageController = new TriageController();

  public constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .getAsync("/", this.authService.isAuthorized(), this.triageController.getAllTriages)
      .postAsync("/", this.authService.isAuthorized(), this.triageController.createTriage)
      .getAsync("/:id", this.authService.isAuthorized(), this.triageController.getTriageById)
      .patchAsync("/:id", this.authService.isAuthorized(), this.triageController.modifyTriage)
      .deleteAsync("/:id", this.authService.isAuthorized(), this.triageController.deleteTriage)
      .patchAsync("/:id/update", this.authService.isAuthorized(), this.triageController.updateTriage);
  }
}