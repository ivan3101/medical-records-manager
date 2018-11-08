import { Router } from "express";
import { AuthService } from "../../services/authService";
import { MedicalRecordController } from "./medicalRecord.controller";

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
      .get("/", this.authService.isAuthorized(), this.medicalRecordController.getAllMedicalRecords)
      .post("/", this.authService.isAuthorized(), this.medicalRecordController.createMedicalRecord)
      .get("/:id", this.authService.isAuthorized(), this.medicalRecordController.getMedicalRecordById)
      .post("/:id", this.authService.isAuthorized(), this.medicalRecordController.updateMedicalRecord)
      .patch("/:id", this.authService.isAuthorized(), this.medicalRecordController.modifyMedicalRecord)
      .delete("/:id", this.authService.isAuthorized(), this.medicalRecordController.deleteMedicalRecord);
  }
}
