import { decorateApp } from "@awaitjs/express";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as helmet from "helmet";
import { ErrorService } from "./services/errorService";

export class Server {
    private readonly app = decorateApp(express());

    public constructor() {
        this.initConfig();
        this.initRoutes();
    }

    public get App(): express.Application {
        return this.app;
    }

    private initConfig(): void {
        this.app.use(helmet());
        this.app.use(bodyParser.json());
    }

    private initRoutes(): any {
        this.app
            .getAsync("/", async (req, res) => {
                return new Promise((resolve, reject) => {
                    setImmediate(() => reject(new Error('woops')))
                })
            })
            .use(ErrorService.errorHandler());
    }
}
