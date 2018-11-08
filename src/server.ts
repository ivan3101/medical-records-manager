import { decorateApp } from "@awaitjs/express";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as helmet from "helmet";
import {Server as HttpServer} from "http";
import {connection} from "mongoose";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { MedicalRecordRoutes } from "./modules/medicalRecord/medicalRecord.routes";
import { OnHoldRoutes } from "./modules/onHold/onHold.routes";
import { PatientRoutes } from "./modules/patient/patient.routes";
import { PersonalRoutes } from "./modules/personal/personal.routes";
import { StudentRoutes } from "./modules/student/student.routes";
import { TempPasswordRoutes } from "./modules/tempPassword/tempPassword.routes";
import { TriageRoutes } from "./modules/triage/triage.routes";
import { AgendaService } from "./services/agendaService";
import { AuthService } from "./services/authService";
import { ErrorService } from "./services/errorService";

export class Server {

  public static closeConnection(server: HttpServer): void {
    server.close(() => {
      connection.close(true, () => {
        new AgendaService().Agenda.stop().then(() => {
            process.exit(0);
          }
        )
      })
    })
  }

  private readonly app = express();
  private readonly errorService = new ErrorService();
  private readonly authService: AuthService = new AuthService();
  private readonly agenda = new AgendaService();

  public constructor() {
    this.initConfig();
    this.initRoutes();
    this.initErrorHandlers();
    this.agenda.startAgenda();
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
      .use("/api/auth", new AuthRoutes().Router)
      .use("/api/medicalrecord", new MedicalRecordRoutes().Router)
      .use("/api/onhold", new OnHoldRoutes().Router)
      .use("/api/patient", new PatientRoutes().Router)
      .use("/api/personal", new PersonalRoutes().Router)
      .use("/api/student", new StudentRoutes().Router)
      .use("/api/temppassword", new TempPasswordRoutes().Router)
      .use("/api/triage", new TriageRoutes().Router);
  }

  private initErrorHandlers(): any {
    this.app
      .use(this.errorService.boomErrorHandler())
      .use(this.errorService.errorHandler());
  }
}
