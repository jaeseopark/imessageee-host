import cors from "cors";
import express from "express";
import expressWs from "express-ws";

import {
    isValidJson
} from "./util/serial";
import MessagesApp from "./MessagesApp";
import ICloudHandlerFactoryImpl from "./bizlog/ICloudHandlerFactoryImpl";
import ContactsApp from "./ContactsApp";

const READINESS_CHECK_INTERVAL = 5000;

const port = process.env.IMF_PORT || 3237;
const wsInstance = expressWs(express());
const app = wsInstance.app;
const wsServer = wsInstance.getWss();

let contactsApp;
let messagesApp;

export const start = (log) => {
    const iCloudHandlerFactory = new ICloudHandlerFactoryImpl();
    contactsApp = new ContactsApp(iCloudHandlerFactory);
    messagesApp = new MessagesApp(contactsApp, iCloudHandlerFactory);

    contactsApp.initialize();

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
                log("You just wrote a message");

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

        log("A new client connected");

        ws.on("close", () => {
            log("A client disconnected");
        });

        configureClient();
    });

    const listen = () => {
        if (!contactsApp.isReady()) {
            return setTimeout(listen, READINESS_CHECK_INTERVAL);
        }
        log("Ready to receive messages from your friend");
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

    const httpServer = app.listen(port, () => log("App started successfully"));
}

export const shutdown = () => {
    console.log("Shutdown signal received");
    messagesApp.cleanup();
    httpServer.close();
    wsServer.close();
};
