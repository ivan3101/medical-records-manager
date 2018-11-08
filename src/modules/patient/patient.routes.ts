import { Router } from "express";
import { AuthService } from "../../services/authService";
import { PatientController } from "./patient.controller";

export class PatientRoutes {
  private readonly router = Router();
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
      .get("/", this.authService.isAuthorized(), this.patientController.getAllPatients)
      .post("/", this.authService.isAuthorized(), this.patientController.addPatient)
      .get("/:id", this.authService.isAuthorized, this.patientController.getPatientById)
      .patch("/:id", this.authService.isAuthorized(), this.patientController.modifyPatient)
      .delete("/:id", this.authService.isAuthorized(), this.patientController.deletePatient)
      .get("/:id/triage", this.authService.isAuthorized(), this.patientController.getTriagePatient)
      .get("/:id/medicalrecord", this.authService.isAuthorized(), this.patientController.getMedicalRecordPatient)
  }
}
