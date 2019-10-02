import { Router } from "express";
import formidableMiddleware = require("express-formidable");
import { join } from "path";
import { AuthService } from "../../services/authService";
import { OnHoldController } from "./onHold.controller";

export class OnHoldRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly onHoldController: OnHoldController = new OnHoldController();

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
        this.authService.hasPermission("onHold", "read"),
        this.onHoldController.getAllOnHolds)

      .get("/student/:studentId/patient/:patientId",
        this.authService.isAuthorized(),
        this.onHoldController.getOnHoldsByStudent
        )

      .post("/:studentId",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "create"),
        formidableMiddleware({
          multiples: true,
          uploadDir: join(process.cwd(), "uploads"),
        }),
        this.onHoldController.createOnHold
      )

      .get("/:professorId",
        this.authService.isAuthorized(),
        this.onHoldController.getOnHoldsByProfessor
        )

      .post("/:onHoldId/approve/:professorId",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "change status"),
        this.onHoldController.approveOnHoldNew)

      .post("/:onHoldId/reject/:professorId",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "change status"),
        this.onHoldController.rejectOnHold)
  }
}