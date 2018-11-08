import { Router } from "express";
import { AuthService } from "../../services/authService";
import { TriageController } from "./triage.controller";

export class TriageRoutes {
  private readonly router = Router();
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
      .get("/", this.authService.isAuthorized(), this.triageController.getAllTriages)
      .post("/", this.authService.isAuthorized(), this.triageController.createTriage)
      .get("/:id", this.authService.isAuthorized(), this.triageController.getTriageById)
      .patch("/:id", this.authService.isAuthorized(), this.triageController.modifyTriage)
      .delete("/:id", this.authService.isAuthorized(), this.triageController.deleteTriage)
      .patch("/:id/update", this.authService.isAuthorized(), this.triageController.updateTriage);
  }
}