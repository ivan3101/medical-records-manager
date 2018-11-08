import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthService } from "../../services/authService";
import { PatientController } from "./patient.controller";

export class PatientRoutes {
  private readonly router = decorateApp(Router());
  private readonly authService: AuthService = new AuthService();
  private readonly patientController: PatientController = new PatientController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .getAsync("/", this.authService.isAuthorized(), this.patientController.getAllPatients)
      .postAsync("/", this.authService.isAuthorized(), this.patientController.addPatient)
      .getAsync("/:id", this.authService.isAuthorized, this.patientController.getPatientById)
      .patchAsync("/:id", this.authService.isAuthorized(), this.patientController.modifyPatient)
      .deleteAsync("/:id", this.authService.isAuthorized(), this.patientController.deletePatient)
      .getAsync("/:id/triage", this.authService.isAuthorized(), this.patientController.getTriagePatient)
      .getAsync("/:id/medicalrecord", this.authService.isAuthorized(), this.patientController.getMedicalRecordPatient)
  }
}
