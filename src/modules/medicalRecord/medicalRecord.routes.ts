import { Router } from "express";
import formidableMiddleware = require("express-formidable");
import { AuthService } from "../../services/authService";
import { MedicalRecordController } from "./medicalRecord.controller";
import { join } from "path";

export class MedicalRecordRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly medicalRecordController: MedicalRecordController = new MedicalRecordController();

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
        this.authService.hasPermission("medicalRecord", "read"),
        this.medicalRecordController.getAllMedicalRecords)

      .post("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("medicalRecord", "create"),
        formidableMiddleware({
          multiples: true,
          uploadDir: join(process.cwd(), "uploads"),
        }),
        this.medicalRecordController.createMedicalRecord)

      .get("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("medicalRecord", "read"),
        this.medicalRecordController.getMedicalRecordById)

      .patch("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("medicalRecord", "update"),
        formidableMiddleware({
          multiples: true,
          uploadDir: join(process.cwd(), "uploads")
        }),
        this.medicalRecordController.modifyMedicalRecord)

      .delete("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("medicalRecord", "delete"),
        this.medicalRecordController.deleteMedicalRecord);
  }
}
