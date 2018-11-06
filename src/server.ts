import { decorateApp } from "@awaitjs/express";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as helmet from "helmet";
import {Server as HttpServer} from "http";
import {connection} from "mongoose";
import { AuthController } from "./modules/auth/auth.controller";
import { TempPasswordController } from "./modules/tempPassword/tempPassword.controller";
import { AuthService } from "./services/authService";
import { ErrorService } from "./services/errorService";

export class Server {

  public static closeConnection(server: HttpServer): void {
    server.close(() => {
      connection.close(true, () => {
        process.exit(0);
      })
    })
  }

  private readonly app = decorateApp(express());
  private readonly errorService = new ErrorService();
  private readonly authService: AuthService = new AuthService();

  public constructor() {
    this.initConfig();
    this.initRoutes();
    this.initErrorHandlers();
  }

  public get App(): express.Application {
    return this.app;
  }

  private initConfig(): void {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.authService.initStrategy();
  }

  private initRoutes(): any {
    this.app
      .postAsync("/personal", new AuthController().signinPersonal)
      .postAsync("/temp", new AuthController().signinTempPassword)
      .postAsync("/tempGenerate", new TempPasswordController().createTempPassword)
      .get("/",
        this.authService.isAuthorized(),
        (req, res) => {
          res.status(200).send("Holis")
        })
  }

  private initErrorHandlers(): any {
    this.app
      .use(this.errorService.boomErrorHandler())
      .use(this.errorService.errorHandler());
  }
}
