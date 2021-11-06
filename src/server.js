import cors from "cors";
import express from "express";
import expressWs from "express-ws";

import { isValidJson } from "./util/serial.js";
import MessagesApp from "./MessagesApp.js";
import ICloudHandlerFactoryImpl from "./bizlog/MessageHandlerFactoryImpl.js";
import ContactsApp from "./ContactsApp.js";

const READINESS_CHECK_INTERVAL = 5000;

const port = process.env.IMF_PORT || 3237;
const wsInstance = expressWs(express());
const app = wsInstance.app;
const wsServer = wsInstance.getWss();

const iCloudHandlerFactory = new ICloudHandlerFactoryImpl();
const contactsApp = new ContactsApp(iCloudHandlerFactory);
const messagesApp = new MessagesApp(contactsApp, iCloudHandlerFactory);

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

// Handle outgoing messages (written by me)
app.ws("/", (ws) => {
    const configureClient = () => {
        if (!contactsApp.isReady()) {
            return setTimeout(configureClient, READINESS_CHECK_INTERVAL);
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
const listen = () => {
    if (!contactsApp.isReady()) {
        return setTimeout(listen, READINESS_CHECK_INTERVAL);
    }
    console.log("Listening for incoming messages...");
    messagesApp.listen((m) => wsServer.clients.forEach((client) => client.send(JSON.stringify(m))));
};
listen();

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

contactsApp.initialize();

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
