import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthService } from "../../services/authService";
import { OnHoldController } from "./onHold.controller";

export class OnHoldRoutes {
  private readonly router = decorateApp(Router());
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
      .getAsync("/", this.authService.isAuthorized(), this.onHoldController.getAllOnHolds)
      .postAsync("/", this.authService.isAuthorized(), this.onHoldController.createOnHold)
      .getAsync("/:id", this.authService.isAuthorized(), this.onHoldController.getOnHoldById)
      .patchAsync("/:id", this.authService.isAuthorized(), this.onHoldController.modifyOnHold)
      .patchAsync("/:id/new", this.authService.isAuthorized(), this.onHoldController.approveOnHoldNew)
      .patchAsync("/:id/mod", this.authService.isAuthorized(), this.onHoldController.approveOnHoldMod)
      .patchAsync("/:id/reject", this.authService.isAuthorized(), this.onHoldController.rejectOnHold)
  }
}