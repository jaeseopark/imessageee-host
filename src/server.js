import cors from "cors";
import express from "express";
import expressWs from "express-ws";

import { isValidJson } from "./util/serial.js";
import MessagesApp from "./MessagesApp.js";
import MessageHandlerFactoryImpl from "./bizlog/MessageHandlerFactoryImpl.js";

const port = process.env.IMF_PORT || 3237;
const wsInstance = expressWs(express());
const app = wsInstance.app;
const wsServer = wsInstance.getWss();

const messageHandlerFactory = new MessageHandlerFactoryImpl();
const messagesApp = new MessagesApp(messageHandlerFactory);

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

// Handle outgoing messages (written by me)
app.ws("/", (ws) => {
    const configureClient = () => {
        if (!messagesApp.isReady()) {
            setTimeout(configureClient, 3000);
            return;
        }

        messagesApp
            .getPreloadEvents()
            .then((events) => events.forEach((event) => ws.send(JSON.stringify(event))));

        ws.on("message", (msg) => {
            console.log("message event");

            if (!isValidJson(msg)) {
                return ws.send(
                    JSON.stringify({
                        error: "Not a valid json string",
                    })
                );
            }

            const reqBody = JSON.parse(msg);
            messagesApp.send(reqBody).catch((error) =>
                ws.send(
                    JSON.stringify({
                        error,
                    })
                )
            );
        });
    };

    console.log("a new client connected");

    ws.on("close", () => {
        console.log("a client closed");
    });

    configureClient();
});

// Handle incoming messages (written by a friend)
messagesApp.listen((m) => wsServer.clients.forEach((client) => client.send(JSON.stringify(m))));

// Handle file requests (HTTP)
app.get("/attachment/:attachmentId", (req, res) => {
    messagesApp
        .getAttachmentPath(req.params.attachmentId)
        .then((path) => {
            res.sendFile(path);
        })
        .catch((err) => {
            res.send(JSON.stringify(err));
        });
});

const httpServer = app.listen(port, () => console.log(`Listening on port ${port}...`));

// Graceful shutdown
const shutdown = () => {
    console.log("shutdown signal received");
    messagesApp.cleanup();
    httpServer.close();
    wsServer.close();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
