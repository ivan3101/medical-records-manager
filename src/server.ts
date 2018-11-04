import { decorateApp } from "@awaitjs/express";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as helmet from "helmet";
import {Server as HttpServer} from "http";
import {connection} from "mongoose";
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
    }

    private initRoutes(): any {
        this.app
            .getAsync("/", async (req, res) => {
                return new Promise((resolve, reject) => {
                    setImmediate(() => reject(new Error('woops')))
                })
            });
    }

    private initErrorHandlers(): any {
        this.app
            .use(this.errorService.boomErrorHandler())
            .use(this.errorService.errorHandler());
    }
}
