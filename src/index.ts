import { createServer } from "http";
import { variables } from "./config/globals";
import { Server } from "./server";
import {DbConnService, IDbConnParams} from "./services/dbConnService";

const app = new Server().App;
const port = variables.port;
const server = createServer(app);

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
        const dbConnection = await new DbConnService(dbParams).DbConnection;
    } catch (e) {
        console.error("No se pudo establecer conexión con MongoDB", e);
    }
});

server.on("close", () => {
    // console.log("Server closed");
});

server.on("error", (err) => {
    throw new Error(err.message);
});
