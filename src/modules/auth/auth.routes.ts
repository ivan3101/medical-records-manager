import { decorateApp } from "@awaitjs/express";
import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRoutes {
  private readonly router = Router();
  private readonly authController: AuthController = new AuthController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .post("/personal", this.authController.signinPersonal)
      .post("/student", this.authController.signinTempPassword);
  }
}