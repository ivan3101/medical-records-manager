import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRoutes {
  private readonly router = decorateApp(Router());
  private readonly authController: AuthController = new AuthController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .postAsync("/personal", this.authController.signinPersonal)
      .postAsync("/accesscode", this.authController.signinTempPassword);
  }
}