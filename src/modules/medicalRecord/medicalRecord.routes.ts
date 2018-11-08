import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthService } from "../../services/authService";
import { MedicalRecordController } from "./medicalRecord.controller";

export class MedicalRecordRoutes {
  private readonly router = decorateApp(Router());
  private readonly authService: AuthService = new AuthService();
  private readonly medicalRecordController: MedicalRecordController = new MedicalRecordController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes() {
    this.router
      .getAsync("/", this.authService.isAuthorized(), this.medicalRecordController.getAllMedicalRecords)
      .postAsync("/", this.authService.isAuthorized(), this.medicalRecordController.createMedicalRecord)
      .getAsync("/:id", this.authService.isAuthorized(), this.medicalRecordController.getMedicalRecordById)
      .postAsync("/:id", this.authService.isAuthorized(), this.medicalRecordController.updateMedicalRecord)
      .patchAsync("/:id", this.authService.isAuthorized(), this.medicalRecordController.modifyMedicalRecord)
      .delete("/:id", this.authService.isAuthorized(), this.medicalRecordController.deleteMedicalRecord);
  }
}
