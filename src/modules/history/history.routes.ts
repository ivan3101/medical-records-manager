import { Router } from "express";
import { AuthService } from "../../services/authService";
import { HistoryController } from "./history.controller";

export class HistoryRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly historyController: HistoryController = new HistoryController();

  constructor() {
    this.initRoutes();
  }

  public get Router(): Router {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .get('/bypatient/:patientId',
        this.authService.isAuthorized(),
        this.historyController.getPatientHistory)
  }
}