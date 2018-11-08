import { Router } from "express";
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
      .get("/", this.authService.isAuthorized(), this.onHoldController.getAllOnHolds)
      .post("/", this.authService.isAuthorized(), this.onHoldController.createOnHold)
      .get("/:id", this.authService.isAuthorized(), this.onHoldController.getOnHoldById)
      .patch("/:id", this.authService.isAuthorized(), this.onHoldController.modifyOnHold)
      .patch("/:id/new", this.authService.isAuthorized(), this.onHoldController.approveOnHoldNew)
      .patch("/:id/mod", this.authService.isAuthorized(), this.onHoldController.approveOnHoldMod)
      .patch("/:id/reject", this.authService.isAuthorized(), this.onHoldController.rejectOnHold)
  }
}