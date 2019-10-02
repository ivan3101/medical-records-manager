import Agenda = require("agenda");
import { AgendaConfiguration, Job } from "agenda";
import { Model } from "mongoose";
import { variables } from "../config/globals";
import { ITempPassword, tempPasswordModel } from "../modules/tempPassword/tempPassword.model";

export class AgendaService {
  public static getClassInstance(): AgendaService {
    if (!AgendaService.classInstance) {
      AgendaService.classInstance = new AgendaService();
    }

    return AgendaService.classInstance;
  }

  private static classInstance: AgendaService;

  private readonly TempPassword: Model<ITempPassword> = tempPasswordModel;
  private readonly agendaConfig: AgendaConfiguration = {
    db: {
      address: `mongodb://${variables.db_host}:${variables.db_port}/${variables.db_name}`,
      collection: "schedulejobs"
    },
    processEvery: "30 seconds"
  };
  private agenda: Agenda;

  private constructor() {
    this.initAgenda();
  }

  public get Agenda(): Agenda {
    return this.agenda;
  }

  public startAgenda(): void {
    this.agenda.on("ready", async () => {
      await this.agenda.start()
    })
  }

  private initAgenda(): void {
    this.agenda = new Agenda(this.agendaConfig);

    this.agenda.define("disable password", async (job: Job, done) => {
      await this.TempPassword.findOneAndUpdate({
        "_id": job.attrs.data.id,
        "estado": "Activo"
      }, {
        $set: {
          "estado": "Inactivo"
        }
      });
      done();
    })
  }
}