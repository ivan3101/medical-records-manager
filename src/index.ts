import { createServer } from "http";
import { variables } from "./config/globals";
import { Server } from "./server";

const app = new Server().App;
const server = createServer(app);

const port = variables.port;

server.listen(port);

server.on("listening", () => {
    // console.log(`Server is listening on port ${port}`);
});

server.on("close", () => {
    // console.log("Server closed");
});

server.on("error", (err) => {
    throw new Error(err.message);
});
