import cors from "cors";
import express from "express";
import expressWs from "express-ws";

import {
    isValidJson
} from "./serial.js";
import MessagesApp from "./MessagesApp.js";
import MessageHandlerFactoryImpl from "./bizlog/MessageHandlerFactoryImpl.js";

const port = process.env.IMF_PORT || 5000;
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
    console.log("a new client connected");

    messagesApp.getRecentMessagesAsEvents().then(events => events.forEach(event => ws.send(JSON.stringify(event))));

    ws.on("message", (msg) => {
        if (!isValidJson(msg)) {
            return ws.send(
                JSON.stringify({
                    error: "Not a valid json string",
                })
            );
        }

        const reqBody = JSON.parse(msg);
        console.log(reqBody);

        messagesApp.send(reqBody)
            .catch((error) =>
                ws.send(
                    JSON.stringify({
                        error,
                    })
                )
            );
    });

    ws.on("close", () => {
        console.log("a client closed");
    });
});

// Handle incoming messages (written by a friend)
messagesApp.listen((m) => wsServer.clients.forEach(client => client.send(JSON.stringify(m))));

const httpServer = app.listen(port, () => console.log(`Listening on port ${port}...`));

// Graceful shutdown
const shutdown = () => {
    console.log('shutdown signal received');
    messagesApp.cleanup();
    httpServer.close();
    wsServer.close();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
