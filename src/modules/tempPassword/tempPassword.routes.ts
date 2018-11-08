import { Router } from "express";
import { AuthService } from "../../services/authService";
import { TempPasswordController } from "./tempPassword.controller";

export class TempPasswordRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly tempPasswordController: TempPasswordController = new TempPasswordController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .post("/", this.authService.isAuthorized(), this.tempPasswordController.createTempPassword);
  }
}