import { decorateApp } from "@awaitjs/express";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as helmet from "helmet";

export class Server {
    private readonly app: express.Application = decorateApp(express());

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
        this.app.get("/", (req, res) => res.status(200).send("Hello world"));
    }
}
