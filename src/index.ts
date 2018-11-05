import {Application} from "express";
import {createServer, Server as HttpServer} from "http";
import {connection} from "mongoose";
import { variables } from "./config/globals";
import { Server } from "./server";
import {DbConnService, IDbConnParams} from "./services/dbConnService";

const app: Application = new Server().App;
const port: number = variables.port;
const server: HttpServer = createServer(app);

server.listen(port);

server.on("listening", async () => {
    const dbParams: IDbConnParams = {
        dbHost: variables.db_host,
        dbName: variables.db_name,
        dbPassword: variables.db_password,
        dbPort: variables.db_port,
        dbUsername: variables.db_username
    };

    try {
        await new DbConnService(dbParams).DbConnection;

        process
            .on('SIGINT', () => {
                Server.closeConnection(server);
            })
            .on("SIGTERM", () => {
                Server.closeConnection(server);
            })
            .on("SIGUSR2", () => {
                server.close(() => {
                    connection.close(true,() => {
                        process.kill(process.pid, 'SIGUSR2');
                    })
                })
            });

    } catch (error) {
        throw new Error(error.message)
    }
});

server.on("error", (err) => {
    throw new Error(err.message);
});
