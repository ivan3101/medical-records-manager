import { Router } from "express";
import formidableMiddleware = require('express-formidable');
import { join } from "path";
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
      .get("/",
        this.authService.isAuthorized(),
        this.authService.hasPermission("triage", "read")
,        this.triageController.getAllTriages)

      .post("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("triage", "create"),
        formidableMiddleware({
          uploadDir: join(process.cwd(), "uploads")
        }),
        this.triageController.createTriage)

      .get("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("triage", "read"),
        this.triageController.getTriageById)

      .patch("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("triage", "modify"),
        formidableMiddleware({
          uploadDir: join(process.cwd(), "uploads")
        }),
        this.triageController.modifyTriage)

      .delete("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("triage", "delete"),
        this.triageController.deleteTriage)
  }
}